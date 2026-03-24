import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { Product, SizeStock } from '@/types/product';
import { DbProduct } from '@/hooks/useProducts';

interface LimitedDropsProps {
  products: DbProduct[];
}

const transformProduct = (dbProduct: DbProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  slug: dbProduct.slug,
  description: dbProduct.description || '',
  shortDescription: dbProduct.description?.slice(0, 100) || '',
  price: dbProduct.price,
  originalPrice: dbProduct.original_price || undefined,
  images: dbProduct.images || [],
  category: dbProduct.categories?.slug as Product['category'] || 'classic',
  club: dbProduct.club || '',
  league: dbProduct.league || '',
  era: dbProduct.era || '',
  kitType: (dbProduct.kit_type as Product['kitType']) || 'home',
  sizeStock: (dbProduct.product_sizes || []).map(s => ({
    size: s.size as SizeStock['size'],
    stock: s.stock,
  })),
  tags: [],
  isFeatured: dbProduct.is_featured || false,
  isNew: dbProduct.is_new || false,
  isSale: !!dbProduct.original_price && dbProduct.original_price > dbProduct.price,
  rating: 0,
  reviewCount: 0,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});

const LimitedDrops = ({ products }: LimitedDropsProps) => {
  const limitedProducts = products
    .filter(p => p.is_new)
    .slice(0, 4)
    .map(transformProduct);

  if (limitedProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 border-b-2 border-foreground">
      <div className="container-tight">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase leading-[0.9]">
              <span className="block">Exclusive</span>
              <span className="block text-outline text-foreground">Releases</span>
            </h2>
          </div>
          <Button asChild>
            <Link to="/shop?filter=new">
              View All Drops
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {limitedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LimitedDrops;
