import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  BarChart3,
  Settings,
  ArrowLeft,
  Image,
  Crown,
  Truck,
  Store,
  Gift,
  MessageSquare,
  Globe,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const baseNavItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Point of Sale', href: '/admin/pos', icon: Store },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Discounts', href: '/admin/discounts', icon: Tag },
  { name: 'Loyalty & Bundles', href: '/admin/loyalty', icon: Gift },
  { name: 'Banners', href: '/admin/banners', icon: Image },
  { name: 'Legends Vault', href: '/admin/gallery', icon: Crown },
  { name: 'Quick Order', href: '/admin/quick-order', icon: MessageSquare },
  { name: 'NCM Shipping', href: '/admin/ncm-settings', icon: Truck },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Theme', href: '/admin/theme', icon: Palette },
  { name: 'Upload Product', href: '/admin/upload', icon: Package },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAdmin, isSuperAdmin } = useAuth();

  const navItems = [
    ...baseNavItems,
    ...(isSuperAdmin ? [{ name: 'Super Admin', href: '/admin/super-admin', icon: Globe }] : []),
  ];

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden">
      {/* Top Bar */}
      <header className="bg-secondary text-secondary-foreground border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-secondary-foreground/80 hover:text-secondary-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Store</span>
            </Link>
            <div className="h-6 w-px bg-secondary-foreground/20" />
            <h1 className="font-display text-xl uppercase tracking-wider">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary-foreground/80">{user.email}</span>
            <Button variant="ghost" size="icon" className="text-secondary-foreground">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-73px)] hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
          <nav className="flex justify-around p-2">
            {navItems.slice(0, 5).map(item => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
                  location.pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 min-w-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;


