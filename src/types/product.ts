export interface SizeStock {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  stock: number;
  price?: number; // Optional size-specific price
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: ProductCategory;
  club: string;
  league: string;
  era: string;
  year?: string;
  player?: string;
  kitType: 'home' | 'away' | 'third' | 'special';
  sizeStock: SizeStock[];
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  isSale: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 
  | 'premier-league'
  | 'la-liga'
  | 'serie-a'
  | 'bundesliga'
  | 'ligue-1'
  | 'international'
  | 'classic'
  | 'limited-edition';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  shippingAddress: ShippingAddress;
  notes?: string;
  giftWrap: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 
  | 'cod'
  | 'esewa'
  | 'khalti'
  | 'bank-transfer';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  district: string;
  city: string;
  area: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}
