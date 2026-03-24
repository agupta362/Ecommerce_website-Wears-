import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onSearchOpen: () => void;
}

const BottomNav = ({ onSearchOpen }: BottomNavProps) => {
  const location = useLocation();
  const { itemCount, toggleCart } = useCart();

  const navItems = [
    { icon: Home, label: 'Home', href: '/', action: undefined },
    { icon: LayoutGrid, label: 'Shop', href: '/shop', action: undefined },
    { icon: Search, label: 'Search', href: undefined, action: onSearchOpen },
    { icon: ShoppingBag, label: 'Cart', href: undefined, action: toggleCart, badge: itemCount },
    { icon: User, label: 'Account', href: '/account', action: undefined },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t-2 border-foreground safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.href ? location.pathname === item.href : false;
          const Icon = item.icon;

          const content = (
            <div className="flex flex-col items-center justify-center gap-1 relative min-w-[48px] min-h-[48px]">
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-8 h-[3px] bg-accent rounded-full" />
              )}
              <div className="relative">
                <Icon className={cn(
                  "h-[22px] w-[22px] transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 h-4 w-4 bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-display uppercase tracking-wider",
                isActive ? "text-foreground font-bold" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </div>
          );

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href!}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
