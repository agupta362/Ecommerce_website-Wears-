import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, Search, User, ChevronRight, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchCommand from '@/components/search/SearchCommand';
import AnnouncementBar from './AnnouncementBar';
import BottomNav from './BottomNav';
import { siteConfig, type NavigationItem } from '@/config/site.config';
import { cn } from '@/lib/utils';
import CurrencySelector from './CurrencySelector';
import { useTemplateLayout, type NavStyle } from '@/hooks/useTemplateLayout';

/* ─── Style maps driven by navStyle ─── */
const headerStyles: Record<NavStyle, string> = {
  'sticky-bold': 'sticky top-0 z-50 bg-background border-b-2 border-foreground',
  'centered-split': 'sticky top-0 z-50 bg-background border-b border-border',
  'hamburger-only': 'sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50',
  'floating-pill': 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-xl rounded-full border border-border shadow-lg max-w-4xl w-[95%]',
  'pill-links': 'sticky top-0 z-50 bg-background border-b border-border',
  'ticker-icons': 'sticky top-0 z-50 bg-background border-b border-border',
  'light-bottom': 'sticky top-0 z-50 bg-background/95 backdrop-blur-sm',
  'traditional': 'sticky top-0 z-50 bg-background border-b border-border',
  'newspaper-broadsheet': 'sticky top-0 z-50 bg-background border-b-2 border-foreground',
};

const navLinkStyles: Record<NavStyle, string> = {
  'sticky-bold': 'font-display text-xs uppercase tracking-wider px-4 py-2 border-2 border-foreground -ml-[2px] transition-colors duration-200',
  'centered-split': 'text-sm tracking-wide px-4 py-2 transition-colors duration-200 hover:text-primary',
  'hamburger-only': 'hidden',
  'floating-pill': 'text-sm px-3 py-1.5 rounded-full transition-colors duration-200 hover:bg-muted',
  'pill-links': 'text-sm px-4 py-1.5 rounded-full border border-border transition-colors duration-200 hover:bg-primary hover:text-primary-foreground hover:border-primary',
  'ticker-icons': 'font-display text-xs uppercase tracking-wider px-4 py-2 transition-colors duration-200 hover:text-accent',
  'light-bottom': 'text-sm px-4 py-2 transition-colors duration-200 text-muted-foreground hover:text-foreground',
  'traditional': 'text-sm px-4 py-2 transition-colors duration-200 border-b-2 border-transparent hover:border-primary',
  'newspaper-broadsheet': 'font-display text-xs uppercase tracking-wider px-4 py-2 border-b border-transparent hover:border-foreground transition-colors duration-200',
};

const navLinkActiveStyles: Record<NavStyle, string> = {
  'sticky-bold': 'bg-accent text-accent-foreground',
  'centered-split': 'text-primary font-medium',
  'hamburger-only': '',
  'floating-pill': 'bg-primary text-primary-foreground',
  'pill-links': 'bg-primary text-primary-foreground border-primary',
  'ticker-icons': 'text-accent',
  'light-bottom': 'text-foreground font-medium',
  'traditional': 'border-primary text-primary',
  'newspaper-broadsheet': 'border-foreground font-bold',
};

const navLinkInactiveStyles: Record<NavStyle, string> = {
  'sticky-bold': 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
  'centered-split': 'text-muted-foreground',
  'hamburger-only': '',
  'floating-pill': 'text-foreground',
  'pill-links': 'text-foreground',
  'ticker-icons': 'text-foreground',
  'light-bottom': 'text-muted-foreground',
  'traditional': 'text-foreground',
  'newspaper-broadsheet': 'text-foreground',
};

const dropdownStyles: Record<NavStyle, string> = {
  'sticky-bold': 'bg-background border-2 border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]',
  'centered-split': 'bg-background border border-border shadow-lg rounded-md',
  'hamburger-only': 'bg-background border border-border shadow-lg rounded-md',
  'floating-pill': 'bg-background/95 backdrop-blur-xl border border-border shadow-lg rounded-xl',
  'pill-links': 'bg-background border border-border shadow-lg rounded-lg',
  'ticker-icons': 'bg-background border border-border shadow-lg',
  'light-bottom': 'bg-background border border-border shadow-md rounded-md',
  'traditional': 'bg-background border border-border shadow-md rounded-sm',
  'newspaper-broadsheet': 'bg-background border border-foreground shadow-md',
};

const dropdownItemStyles: Record<NavStyle, string> = {
  'sticky-bold': 'block px-4 py-3 font-display text-xs uppercase tracking-wider border-b border-border last:border-b-0 transition-colors hover:bg-accent hover:text-accent-foreground',
  'centered-split': 'block px-4 py-2.5 text-sm transition-colors hover:bg-muted rounded-sm',
  'hamburger-only': 'block px-4 py-2.5 text-sm transition-colors hover:bg-muted',
  'floating-pill': 'block px-4 py-2.5 text-sm transition-colors hover:bg-muted rounded-lg',
  'pill-links': 'block px-4 py-2.5 text-sm transition-colors hover:bg-muted rounded-md',
  'ticker-icons': 'block px-4 py-2.5 text-xs uppercase tracking-wider transition-colors hover:bg-accent hover:text-accent-foreground',
  'light-bottom': 'block px-4 py-2.5 text-sm transition-colors hover:bg-muted',
  'traditional': 'block px-4 py-2.5 text-sm transition-colors hover:bg-muted',
  'newspaper-broadsheet': 'block px-4 py-2.5 text-sm font-display transition-colors hover:bg-muted border-b border-border last:border-b-0',
};

const logoStyles: Record<NavStyle, string> = {
  'sticky-bold': 'font-display text-lg lg:text-2xl font-bold uppercase tracking-wider',
  'centered-split': 'font-display text-xl lg:text-2xl tracking-widest',
  'hamburger-only': 'font-display text-lg lg:text-xl tracking-wider',
  'floating-pill': 'font-display text-base font-semibold tracking-wider',
  'pill-links': 'font-display text-lg tracking-wider font-medium',
  'ticker-icons': 'font-display text-lg font-bold uppercase tracking-wider',
  'light-bottom': 'font-display text-lg tracking-wide',
  'traditional': 'font-display text-xl lg:text-2xl italic',
  'newspaper-broadsheet': 'font-display text-2xl lg:text-3xl font-bold tracking-tight',
};

const badgeStyles: Record<NavStyle, string> = {
  'sticky-bold': 'absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold',
  'centered-split': 'absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full',
  'hamburger-only': 'absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full',
  'floating-pill': 'absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full',
  'pill-links': 'absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full',
  'ticker-icons': 'absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs flex items-center justify-center',
  'light-bottom': 'absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full',
  'traditional': 'absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full',
  'newspaper-broadsheet': 'absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center',
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMobileNav, setExpandedMobileNav] = useState<string | null>(null);
  const location = useLocation();
  const { itemCount, toggleCart } = useCart();
  const { wishlist } = useWishlist();
  const { navStyle } = useTemplateLayout();

  const navigation = siteConfig.navigation;
  const isFloating = navStyle === 'floating-pill';
  const showDesktopNav = navStyle !== 'hamburger-only';

  return (
    <>
      <header className={cn(headerStyles[navStyle], 'overflow-visible')}>
        {!isFloating && <AnnouncementBar />}

        <div className={isFloating ? 'px-4' : 'container-tight'}>
          <div className={cn('flex items-center justify-between', isFloating ? 'h-12' : 'h-12 lg:h-16')}>
            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className={logoStyles[navStyle]}>
                {siteConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            {showDesktopNav && (
              <nav className="hidden lg:flex items-center gap-0">
                {navigation.map((item, idx) => (
                  <DesktopNavItem key={item.name} item={item} idx={idx} currentPath={location.pathname} navStyle={navStyle} />
                ))}
              </nav>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="hidden lg:block">
                <CurrencySelector />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:inline-flex h-10 w-10"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link to="/wishlist" className="hidden lg:block">
                <Button variant="ghost" size="icon" className="relative h-10 w-10">
                  <Heart className="h-5 w-5" />
                  {wishlist.length > 0 && (
                    <span className={badgeStyles[navStyle]}>
                      {wishlist.length}
                    </span>
                  )}
                </Button>
              </Link>

              <Link to="/account" className="hidden lg:block">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 lg:h-10 lg:w-10"
                onClick={toggleCart}
              >
                <ShoppingBag className="h-4 w-4 lg:h-5 lg:w-5" />
                {itemCount > 0 && (
                  <span className={cn(badgeStyles[navStyle], 'h-4 w-4 lg:h-5 lg:w-5 text-[10px] lg:text-xs')}>
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-[calc(var(--announcement-height,0px)+48px)] z-40 bg-background overflow-y-auto"
            >
              <div className="container-tight py-6 space-y-1">
                {navigation.map((item) =>
                  item.children ? (
                    <MobileNavAccordion
                      key={item.name}
                      item={item}
                      isExpanded={expandedMobileNav === item.name}
                      onToggle={() => setExpandedMobileNav(expandedMobileNav === item.name ? null : item.name)}
                      currentPath={location.pathname + location.search}
                      onNavigate={() => setIsMobileMenuOpen(false)}
                    />
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center justify-between py-4 px-4 border-b border-border transition-colors",
                        location.pathname === item.href ? 'bg-accent/10 text-accent-foreground' : 'hover:bg-muted'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="font-display text-base uppercase tracking-wider">{item.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  )
                )}

                <div className="pt-6 space-y-1">
                  <div className="flex items-center gap-3 py-3 px-4">
                    <CurrencySelector />
                  </div>
                  <Link to="/wishlist" className="flex items-center gap-3 py-3 px-4 hover:bg-muted transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">Wishlist</span>
                    {wishlist.length > 0 && (
                      <span className="ml-auto text-xs bg-accent text-accent-foreground px-2 py-0.5 font-bold">{wishlist.length}</span>
                    )}
                  </Link>
                  <Link to="/account" className="flex items-center gap-3 py-3 px-4 hover:bg-muted transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="h-5 w-5" />
                    <span className="text-sm">Account</span>
                  </Link>
                  <Link to="/track-order" className="flex items-center gap-3 py-3 px-4 hover:bg-muted transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Search className="h-5 w-5" />
                    <span className="text-sm">Track Order</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CartDrawer />
      </header>

      {isFloating && <AnnouncementBar />}
      <BottomNav onSearchOpen={() => setIsSearchOpen(true)} />
      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

/* ─── Desktop Nav Item ─── */
function DesktopNavItem({ item, idx, currentPath, navStyle }: { item: NavigationItem; idx: number; currentPath: string; navStyle: NavStyle }) {
  const [open, setOpen] = useState(false);

  const baseCls = navLinkStyles[navStyle];
  const activeCls = navLinkActiveStyles[navStyle];
  const inactiveCls = navLinkInactiveStyles[navStyle];
  const isActive = currentPath === item.href;

  if (!item.children) {
    return (
      <Link
        to={item.href}
        className={cn(baseCls, isActive ? activeCls : inactiveCls, idx === 0 && navStyle === 'sticky-bold' && 'ml-0')}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        to={item.href}
        className={cn(baseCls, isActive ? activeCls : inactiveCls, 'flex items-center gap-1', idx === 0 && navStyle === 'sticky-bold' && 'ml-0')}
      >
        {item.name}
        <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
      </Link>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className={cn('absolute left-0 top-full mt-0 min-w-[200px] z-50', dropdownStyles[navStyle])}
          >
            {item.children.map((child) => (
              <Link
                key={child.name}
                to={child.href}
                className={dropdownItemStyles[navStyle]}
              >
                {child.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Mobile Nav Accordion ─── */
function MobileNavAccordion({
  item, isExpanded, onToggle, currentPath, onNavigate,
}: {
  item: NavigationItem; isExpanded: boolean; onToggle: () => void; currentPath: string; onNavigate: () => void;
}) {
  return (
    <div className="border-b border-border">
      <button onClick={onToggle} className="flex items-center justify-between w-full py-4 px-4 transition-colors hover:bg-muted">
        <span className="font-display text-base uppercase tracking-wider">{item.name}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-2">
              {item.children?.map((child) => (
                <Link
                  key={child.name}
                  to={child.href}
                  className={cn(
                    "block py-3 pl-8 pr-4 text-sm transition-colors",
                    currentPath === child.href ? 'bg-accent/10 text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                  onClick={onNavigate}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Header;
