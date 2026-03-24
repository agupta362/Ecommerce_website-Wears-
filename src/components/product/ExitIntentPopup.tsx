import { useState, useEffect, useCallback } from 'react';
import { X, Tag, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { siteConfig } from '@/config/site.config';
import { toast } from 'sonner';

const DISMISSED_KEY = `${siteConfig.storeSlug}_exit_popup_dismissed`;

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, 'true');
    } catch {}
  }, []);

  useEffect(() => {
    // Don't show if already dismissed this session
    try {
      if (sessionStorage.getItem(DISMISSED_KEY)) return;
    } catch {}

    let timeout: ReturnType<typeof setTimeout>;

    // Desktop: mouse leave viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setIsVisible(true);
      }
    };

    // Mobile: show after 30s of browsing as fallback
    timeout = setTimeout(() => {
      try {
        if (!sessionStorage.getItem(DISMISSED_KEY)) {
          setIsVisible(true);
        }
      } catch {
        setIsVisible(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      // Generate a unique discount code
      const code = `WELCOME${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Save to newsletter_subscribers
      const { error: subError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase() });

      if (subError && !subError.message.includes('duplicate')) {
        throw subError;
      }

      // Create the discount code in DB
      const { error: discountError } = await supabase
        .from('discount_codes')
        .insert({
          code,
          discount_type: 'percentage',
          discount_value: 10,
          description: 'Welcome discount - exit intent',
          is_active: true,
          max_uses: 1,
          min_order_amount: 0,
        });

      if (discountError) {
        console.error('Failed to create discount code:', discountError);
        // Still show a generic code even if DB insert fails
      }

      setDiscountCode(code);
      toast.success('Your discount code is ready!');
    } catch (err) {
      console.error('Exit popup error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background border-2 border-foreground max-w-md w-full p-6 sm:p-8 relative"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={dismiss}
            >
              <X className="h-5 w-5" />
            </Button>

            {!discountCode ? (
              <>
                <div className="text-center mb-6">
                  <Tag className="h-10 w-10 mx-auto mb-3 text-accent" />
                  <h2 className="font-display text-2xl uppercase tracking-wider mb-2">
                    Wait! Don't Leave Empty-Handed
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Get <span className="font-bold text-foreground">10% OFF</span> your first order. Enter your email below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-hero" disabled={isSubmitting}>
                    {isSubmitting ? 'Generating...' : 'Get My 10% Off'}
                  </Button>
                </form>

                <p className="text-[10px] text-muted-foreground text-center mt-3">
                  No spam. Unsubscribe anytime.
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="font-display text-xl uppercase tracking-wider mb-2">
                  Your Code is Ready!
                </h2>
                <div className="bg-accent/10 border-2 border-accent p-4 my-4">
                  <p className="font-display text-2xl tracking-widest font-bold">
                    {discountCode}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Use this code at checkout for 10% off your order.
                </p>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(discountCode);
                    toast.success('Code copied!');
                    dismiss();
                  }}
                >
                  Copy & Continue Shopping
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
