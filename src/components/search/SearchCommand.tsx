import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProducts, DbProduct } from '@/hooks/useProducts';
import { Product, SizeStock } from '@/types/product';
import { siteConfig } from '@/config/site.config';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RECENT_SEARCHES_KEY = `${siteConfig.storeSlug}_recent_searches`;

const transformProduct = (dbProduct: DbProduct): Product => {
  const sizeStock: SizeStock[] = dbProduct.product_sizes?.map(ps => ({
    size: ps.size as SizeStock['size'],
    stock: ps.stock ?? 0,
  })) || [];

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || '',
    shortDescription: dbProduct.description?.slice(0, 150) || '',
    price: dbProduct.price,
    originalPrice: dbProduct.original_price ?? undefined,
    images: dbProduct.images || [],
    category: (dbProduct.categories?.slug as Product['category']) || 'classic',
    club: dbProduct.club || '',
    league: dbProduct.league || '',
    era: dbProduct.era || '',
    year: dbProduct.era || '',
    kitType: (dbProduct.kit_type as Product['kitType']) || 'home',
    sizeStock,
    tags: [],
    isFeatured: dbProduct.is_featured,
    isNew: dbProduct.is_new,
    isSale: !!dbProduct.original_price && dbProduct.original_price > dbProduct.price,
    rating: 4.5,
    reviewCount: 0,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
};

// Shared search results content
const SearchResults = ({
  query,
  isLoading,
  hasResults,
  suggestions,
  recentSearches,
  onProductClick,
  onFilterClick,
  onRecentClick,
  onPopularClick,
}: {
  query: string;
  isLoading: boolean;
  hasResults: boolean;
  suggestions: { products: Product[]; teams: string[]; leagues: string[]; eras: string[]; players: string[] };
  recentSearches: string[];
  onProductClick: (p: Product) => void;
  onFilterClick: (type: string, value: string) => void;
  onRecentClick: (term: string) => void;
  onPopularClick: (term: string) => void;
}) => (
  <>
    {isLoading && (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )}

    {!isLoading && !query && recentSearches.length > 0 && (
      <div className="mb-4">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" />
          Recent Searches
        </div>
        {recentSearches.map((term) => (
          <button
            key={term}
            onClick={() => onRecentClick(term)}
            className="w-full px-3 py-3 text-left text-sm rounded hover:bg-muted transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    )}

    {!isLoading && !query && (
      <div>
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-3 w-3" />
          Popular Searches
        </div>
        {siteConfig.search.popularTerms.map((term) => (
          <button
            key={term}
            onClick={() => onPopularClick(term)}
            className="w-full px-3 py-3 text-left text-sm rounded hover:bg-muted transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    )}

    {!isLoading && query && hasResults && (
      <>
        {suggestions.products.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Products</div>
            {suggestions.products.map((product) => (
              <button
                key={product.id}
                onClick={() => onProductClick(product)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded hover:bg-muted transition-colors"
              >
                <img
                  src={product.images[0] || '/placeholder.svg'}
                  alt={product.name}
                  className="h-14 w-14 sm:h-10 sm:w-10 rounded object-cover bg-muted flex-shrink-0"
                />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.club} • Rs. {product.price.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {suggestions.teams.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Teams</div>
            {suggestions.teams.map((team) => (
              <button key={team} onClick={() => onFilterClick('team', team)} className="w-full px-3 py-3 text-left text-sm rounded hover:bg-muted transition-colors">
                {team}
              </button>
            ))}
          </div>
        )}

        {suggestions.leagues.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Leagues</div>
            {suggestions.leagues.map((league) => (
              <button key={league} onClick={() => onFilterClick('league', league)} className="w-full px-3 py-3 text-left text-sm rounded hover:bg-muted transition-colors">
                {league}
              </button>
            ))}
          </div>
        )}

        {suggestions.eras.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Eras</div>
            {suggestions.eras.map((era) => (
              <button key={era} onClick={() => onFilterClick('era', era)} className="w-full px-3 py-3 text-left text-sm rounded hover:bg-muted transition-colors">
                {era}
              </button>
            ))}
          </div>
        )}

        {suggestions.players.length > 0 && (
          <div className="mb-4">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Players</div>
            {suggestions.players.map((player) => (
              <button key={player} onClick={() => onFilterClick('player', player)} className="w-full px-3 py-3 text-left text-sm rounded hover:bg-muted transition-colors">
                {player}
              </button>
            ))}
          </div>
        )}
      </>
    )}

    {!isLoading && query && !hasResults && (
      <div className="py-12 text-center">
        <div className="w-24 h-24 mx-auto mb-4">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
            <circle cx="100" cy="100" r="80" className="fill-muted" />
            <circle cx="90" cy="90" r="30" className="stroke-muted-foreground" strokeWidth="4" fill="none" />
            <path d="M112 112l25 25" className="stroke-muted-foreground" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
        <p className="font-medium mb-1 text-sm">No results for "{query}"</p>
        <p className="text-xs text-muted-foreground">Try a team, player, or league name</p>
      </div>
    )}
  </>
);

const SearchCommand = ({ open, onOpenChange }: SearchCommandProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: dbProducts, isLoading } = useProducts();
  const products = useMemo(() => dbProducts?.map(transformProduct) || [], [dbProducts]);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try { setRecentSearches(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Focus input when mobile overlay opens
  useEffect(() => {
    if (open && isMobile) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, isMobile]);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const allTeams = useMemo(() => [...new Set(products.map(p => p.club).filter(Boolean))], [products]);
  const allLeagues = useMemo(() => [...new Set(products.map(p => p.league).filter(Boolean))], [products]);
  const allEras = useMemo(() => [...new Set(products.map(p => p.era).filter(Boolean))], [products]);
  const allPlayers = useMemo(() => [...new Set(products.filter(p => p.player).map(p => p.player!))], [products]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return { products: [], teams: [], leagues: [], eras: [], players: [] };
    const q = query.toLowerCase();
    return {
      products: products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.league.toLowerCase().includes(q) ||
        (p.player && p.player.toLowerCase().includes(q))
      ).slice(0, 5),
      teams: allTeams.filter(t => t.toLowerCase().includes(q)).slice(0, 3),
      leagues: allLeagues.filter(l => l.toLowerCase().includes(q)).slice(0, 3),
      eras: allEras.filter(e => e.toLowerCase().includes(q)).slice(0, 3),
      players: allPlayers.filter(p => p.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [query, products, allTeams, allLeagues, allEras, allPlayers]);

  const handleProductClick = (product: Product) => {
    saveRecentSearch(product.name);
    onOpenChange(false);
    setQuery('');
    navigate(`/product/${product.slug}`);
  };

  const handleFilterClick = (type: string, value: string) => {
    saveRecentSearch(value);
    onOpenChange(false);
    setQuery('');
    if (type === 'league') navigate(`/shop?league=${encodeURIComponent(value)}`);
    else if (type === 'era') navigate(`/shop?era=${encodeURIComponent(value)}`);
    else navigate(`/shop?search=${encodeURIComponent(value)}`);
  };

  const handleRecentClick = (term: string) => setQuery(term);

  const handlePopularClick = (term: string) => {
    saveRecentSearch(term);
    onOpenChange(false);
    setQuery('');
    navigate(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onOpenChange(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setQuery('');
  };

  const hasResults = suggestions.products.length > 0 || suggestions.teams.length > 0 || suggestions.leagues.length > 0 || suggestions.eras.length > 0 || suggestions.players.length > 0;

  const searchBarContent = (
    <form onSubmit={handleSubmit} className="flex items-center border-b border-border px-4">
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={siteConfig.search.placeholder}
        className="flex h-14 w-full bg-transparent py-3 pl-3 text-base outline-none placeholder:text-muted-foreground"
        autoFocus
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} className="p-2 hover:bg-muted rounded-md mr-1">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      )}
      <button
        type="button"
        onClick={handleClose}
        className="text-sm font-medium text-foreground px-2 py-1 hover:bg-muted rounded-md sm:hidden"
      >
        Cancel
      </button>
    </form>
  );

  const resultsContent = (
    <SearchResults
      query={query}
      isLoading={isLoading}
      hasResults={hasResults}
      suggestions={suggestions}
      recentSearches={recentSearches}
      onProductClick={handleProductClick}
      onFilterClick={handleFilterClick}
      onRecentClick={handleRecentClick}
      onPopularClick={handlePopularClick}
    />
  );

  // Mobile: full-screen fixed overlay (no Dialog)
  if (isMobile) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[60] bg-background flex flex-col">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={siteConfig.search.placeholder}
            className="flex h-14 w-full bg-transparent py-3 pl-3 text-base outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-2 hover:bg-muted rounded-md mr-1">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="text-sm font-medium text-foreground px-3 py-2 hover:bg-muted rounded-md shrink-0"
          >
            Cancel
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {resultsContent}
        </div>
      </div>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden sm:max-h-[85vh]">
        {searchBarContent}
        <div className="overflow-y-auto p-2 max-h-[60vh]">
          {resultsContent}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchCommand;
