import { ReactNode } from 'react';
import { Heart, ShoppingBag, Search, Package, FileQuestion } from 'lucide-react';
import { Button } from './button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type EmptyStateType = 'cart' | 'wishlist' | 'search' | 'orders' | 'generic';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onAction?: () => void;
  className?: string;
  children?: ReactNode;
}

const illustrations: Record<EmptyStateType, ReactNode> = {
  cart: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <path
        d="M60 75h10l20 50h40l15-35H85"
        className="stroke-muted-foreground"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="95" cy="140" r="8" className="fill-muted-foreground/30" />
      <circle cx="125" cy="140" r="8" className="fill-muted-foreground/30" />
      <path
        d="M85 95h35M85 105h25"
        className="stroke-muted-foreground/50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Floating elements */}
      <circle cx="55" cy="55" r="4" className="fill-primary/20" />
      <circle cx="150" cy="60" r="6" className="fill-primary/30" />
      <circle cx="45" cy="120" r="5" className="fill-primary/25" />
      <circle cx="155" cy="130" r="4" className="fill-primary/20" />
    </svg>
  ),
  wishlist: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <path
        d="M100 150s-40-30-40-55c0-15 12-27 27-27 10 0 18 5 23 13 5-8 13-13 23-13 15 0 27 12 27 27 0 25-40 55-40 55z"
        className="stroke-muted-foreground"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Sparkles */}
      <path d="M55 55l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" className="fill-primary/30" />
      <path d="M140 45l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" className="fill-primary/40" />
      <path d="M150 130l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" className="fill-primary/25" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <circle
        cx="90"
        cy="90"
        r="30"
        className="stroke-muted-foreground"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M112 112l25 25"
        className="stroke-muted-foreground"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Question marks */}
      <text x="80" y="98" className="fill-muted-foreground/40" fontSize="24" fontWeight="bold">?</text>
      {/* Floating dots */}
      <circle cx="50" cy="60" r="4" className="fill-primary/20" />
      <circle cx="155" cy="70" r="5" className="fill-primary/30" />
      <circle cx="45" cy="140" r="3" className="fill-primary/25" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <rect
        x="65"
        y="55"
        width="70"
        height="90"
        rx="5"
        className="stroke-muted-foreground"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M80 80h40M80 100h30M80 120h35"
        className="stroke-muted-foreground/50"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Decorative */}
      <circle cx="50" cy="55" r="4" className="fill-primary/25" />
      <circle cx="155" cy="65" r="5" className="fill-primary/30" />
      <circle cx="150" cy="145" r="4" className="fill-primary/20" />
    </svg>
  ),
  generic: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="80" className="fill-muted" />
      <circle cx="100" cy="85" r="25" className="stroke-muted-foreground" strokeWidth="4" fill="none" />
      <text x="92" y="95" className="fill-muted-foreground" fontSize="30" fontWeight="bold">?</text>
      <path
        d="M100 125v15"
        className="stroke-muted-foreground"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const defaultContent: Record<EmptyStateType, { title: string; description: string; actionLabel: string; actionHref: string }> = {
  cart: {
    title: 'Your Cart is Empty',
    description: "Looks like you haven't added any retro classics yet. Start exploring our collection!",
    actionLabel: 'Browse Collection',
    actionHref: '/shop',
  },
  wishlist: {
    title: 'Your Wishlist is Empty',
    description: 'Start adding your favorite retro jerseys to keep track of them. Heart any product to save it here!',
    actionLabel: 'Browse Collection',
    actionHref: '/shop',
  },
  search: {
    title: 'No Results Found',
    description: "We couldn't find any products matching your search. Try different keywords or browse our categories.",
    actionLabel: 'Browse All Products',
    actionHref: '/shop',
  },
  orders: {
    title: 'No Orders Yet',
    description: "You haven't placed any orders yet. Start shopping to see your order history here!",
    actionLabel: 'Start Shopping',
    actionHref: '/shop',
  },
  generic: {
    title: 'Nothing Here',
    description: 'This section is empty. Check back later or explore other parts of our store.',
    actionLabel: 'Go to Shop',
    actionHref: '/shop',
  },
};

const iconMap: Record<EmptyStateType, ReactNode> = {
  cart: <ShoppingBag className="h-6 w-6" />,
  wishlist: <Heart className="h-6 w-6" />,
  search: <Search className="h-6 w-6" />,
  orders: <Package className="h-6 w-6" />,
  generic: <FileQuestion className="h-6 w-6" />,
};

const EmptyState = ({
  type,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  onAction,
  className,
  children,
}: EmptyStateProps) => {
  const defaults = defaultContent[type];
  const finalTitle = title || defaults.title;
  const finalDescription = description || defaults.description;
  const finalActionLabel = actionLabel || defaults.actionLabel;
  const finalActionHref = actionHref || defaults.actionHref;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {/* Illustration */}
      <div className="w-40 h-40 mb-6 animate-fade-in">
        {illustrations[type]}
      </div>

      {/* Content */}
      <h3 className="font-display text-xl md:text-2xl uppercase tracking-wider mb-3">
        {finalTitle}
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        {finalDescription}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onAction ? (
          <Button onClick={onAction} size="lg" className="btn-hero gap-2">
            {iconMap[type]}
            {finalActionLabel}
          </Button>
        ) : (
          <Button asChild size="lg" className="btn-hero gap-2">
            <Link to={finalActionHref}>
              {iconMap[type]}
              {finalActionLabel}
            </Link>
          </Button>
        )}
        
        {secondaryActionLabel && secondaryActionHref && (
          <Button asChild variant="outline" size="lg">
            <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
          </Button>
        )}
      </div>

      {children}
    </div>
  );
};

export default EmptyState;
