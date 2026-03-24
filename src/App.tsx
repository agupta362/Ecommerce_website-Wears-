import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { PageTransition } from "@/components/animations";
import ThemeInjector from "@/config/ThemeInjector";
import { ThemePreviewProvider } from "@/context/ThemePreviewContext";

// Public pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Contact from "./pages/Contact";
import SizeGuide from "./pages/SizeGuide";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import Addresses from "./pages/Addresses";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminNCMSettings from "./pages/admin/AdminNCMSettings";
import AdminPOS from "./pages/admin/AdminPOS";
import AdminLoyaltySettings from "./pages/admin/AdminLoyaltySettings";
import SuperAdmin from "./pages/admin/SuperAdmin";
import AdminQuickOrder from "./pages/admin/AdminQuickOrder";
import AdminTheme from "./pages/admin/AdminTheme";

// UploadProduct page
import UploadProduct from "@/components/admin/UploadProduct";

// Other pages/components
import LegendsVault from "./pages/LegendsVault";
import TrackOrder from "./pages/TrackOrder";
import SetupGuide from "./pages/SetupGuide";
import SocialProofNotification from "./components/product/SocialProofNotification";
import ScrollToTop from "./components/layout/ScrollToTop";
import BackToTop from "./components/ui/BackToTop";
import PageLoader from "./components/ui/PageLoader";
import ScrollProgress from "./components/ui/ScrollProgress";
import SkipToContent from "./components/ui/SkipToContent";
import ExitIntentPopup from "./components/product/ExitIntentPopup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Pages */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/order-confirmation" element={<PageTransition><OrderConfirmation /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/size-guide" element={<PageTransition><SizeGuide /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/shipping-policy" element={<PageTransition><ShippingPolicy /></PageTransition>} />
        <Route path="/return-policy" element={<PageTransition><ReturnPolicy /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
        <Route path="/account/addresses" element={<PageTransition><Addresses /></PageTransition>} />
        <Route path="/legends-vault" element={<PageTransition><LegendsVault /></PageTransition>} />
        <Route path="/track-order" element={<PageTransition><TrackOrder /></PageTransition>} />
        <Route path="/setup-guide" element={<PageTransition><SetupGuide /></PageTransition>} />

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="discounts" element={<AdminDiscounts />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="ncm-settings" element={<AdminNCMSettings />} />
          <Route path="pos" element={<AdminPOS />} />
          <Route path="loyalty" element={<AdminLoyaltySettings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="super-admin" element={<SuperAdmin />} />
          <Route path="quick-order" element={<AdminQuickOrder />} />
          <Route path="theme" element={<AdminTheme />} />
          <Route path="upload" element={<UploadProduct />} /> {/* UploadProduct route */}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemePreviewProvider>
      <ThemeInjector />
      <TooltipProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <SkipToContent />
                  <ScrollProgress />
                  <PageLoader />
                  <ScrollToTop />
                  <div className="pb-14 lg:pb-0 overflow-x-hidden">
                    <AnimatedRoutes />
                  </div>
                  <SocialProofNotification />
                  <BackToTop />
                  <ExitIntentPopup />
                </BrowserRouter>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemePreviewProvider>
  </QueryClientProvider>
);

export default App;