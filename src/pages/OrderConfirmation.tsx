import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, MessageCircle, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';
import { toast } from 'sonner';
import { siteConfig } from '@/config/site.config';

const OrderConfirmation = () => {
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string })?.orderNumber;

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      toast.success('Order number copied!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Order Confirmed"
        description="Thank you for your order. We will contact you shortly for confirmation."
        url="/order-confirmation"
      />
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="container-tight py-16">
          <div className="max-w-md mx-auto text-center">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
            
            <h1 className="font-display text-3xl uppercase tracking-wider mb-4">
              Thank You!
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              Your order has been placed successfully.
            </p>

            {orderNumber && (
              <div className="bg-card p-6 rounded-lg mb-6 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="font-mono text-xl font-bold tracking-wider">{orderNumber}</span>
                  <button
                    onClick={copyOrderNumber}
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    aria-label="Copy order number"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Save this number! You'll need it to track your order.
                </p>
              </div>
            )}
            
            <div className="bg-card p-6 rounded-lg mb-8">
              <h2 className="font-display text-lg uppercase tracking-wider mb-4">
                What's Next?
              </h2>
              <p className="text-muted-foreground mb-4">
                We will contact you shortly to confirm your order and delivery details.
              </p>
              
              <div className="space-y-3 mt-6">
                <p className="text-sm font-medium text-center mb-2">Need quick assistance? DM us:</p>
                <div className="flex items-center justify-center gap-4">
                  <a
                    href={`${siteConfig.social.whatsapp}?text=Hi! I just placed an order and would like to confirm.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-[hsl(145,65%,35%)] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {orderNumber && (
                <Button asChild className="w-full" size="lg" variant="outline">
                  <Link to={`/track-order?order=${encodeURIComponent(orderNumber)}`}>
                    Track Your Order
                  </Link>
                </Button>
              )}
              <Button asChild className="w-full btn-hero" size="lg">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
