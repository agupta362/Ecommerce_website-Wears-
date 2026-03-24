import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { checkRateLimit, getAnonymousIdentifier } from '@/hooks/useRateLimit';
import { siteConfig } from '@/config/site.config';
import TrustBadges from '@/components/ui/TrustBadges';
import PaymentMethods from '@/components/ui/PaymentMethods';
import { useTemplateLayout } from '@/hooks/useTemplateLayout';
import { cn } from '@/lib/utils';

const footerBgStyles: Record<string, string> = {
  raw: 'bg-foreground text-background',
  borderless: 'bg-muted text-foreground',
  overlay: 'bg-foreground text-background',
  glass: 'bg-card text-card-foreground border-t border-border',
  soft: 'bg-muted text-foreground',
  terminal: 'bg-foreground text-background',
  elevated: 'bg-muted text-foreground',
  editorial: 'bg-card text-card-foreground border-t border-border',
  'newspaper-broadsheet': 'bg-foreground text-background',
};

const footerLinkStyles: Record<string, string> = {
  raw: 'text-background/70 hover:text-accent',
  borderless: 'text-muted-foreground hover:text-primary',
  overlay: 'text-background/70 hover:text-accent',
  glass: 'text-muted-foreground hover:text-primary',
  soft: 'text-muted-foreground hover:text-primary',
  terminal: 'text-background/70 hover:text-accent',
  elevated: 'text-muted-foreground hover:text-primary',
  editorial: 'text-muted-foreground hover:text-primary',
  'newspaper-broadsheet': 'text-background/70 hover:text-accent',
};

const footerHeadingStyles: Record<string, string> = {
  raw: 'text-accent',
  borderless: 'text-primary',
  overlay: 'text-accent',
  glass: 'text-primary',
  soft: 'text-primary',
  terminal: 'text-accent',
  elevated: 'text-primary',
  editorial: 'text-primary',
  'newspaper-broadsheet': 'text-accent',
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cardStyle } = useTemplateLayout();

  const bgStyle = footerBgStyles[cardStyle] || footerBgStyles.raw;
  const linkStyle = footerLinkStyles[cardStyle] || footerLinkStyles.raw;
  const headingStyle = footerHeadingStyles[cardStyle] || footerHeadingStyles.raw;
  const isDark = ['raw', 'overlay', 'terminal', 'newspaper-broadsheet'].includes(cardStyle);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      const identifier = email.toLowerCase() || getAnonymousIdentifier();
      const rateLimitResult = await checkRateLimit('newsletter', identifier);
      if (!rateLimitResult.allowed) {
        toast.error(rateLimitResult.message || 'Too many attempts. Please try again later.');
        return;
      }
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.toLowerCase() });
      if (error) {
        if (error.code === '23505') toast.info('You are already subscribed!');
        else throw error;
      } else {
        toast.success('Successfully subscribed to the newsletter!');
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer>
      {/* Newsletter */}
      {siteConfig.features.newsletter && (
        <div className={cn(isDark ? 'border-t-2 border-b-2 border-foreground' : 'border-t border-b border-border')}>
          <div className="container-tight py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="font-display text-3xl lg:text-4xl uppercase tracking-wider mb-2">Join the Glory Club</h3>
              <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wider">{siteConfig.newsletter.description}</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-0 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="YOUR EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 uppercase text-xs tracking-wider h-11"
                  required
                />
                <Button type="submit" className="h-11 px-6" disabled={isSubmitting}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer */}
      <div className={bgStyle}>
        <div className="container-tight py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <span className="font-display text-xl font-bold uppercase tracking-wider block mb-4">{siteConfig.name}</span>
              <p className={cn('text-xs uppercase tracking-wider leading-relaxed mb-4', isDark ? 'text-background/70' : 'text-muted-foreground')}>{siteConfig.footer.about}</p>
              <div className="flex items-center gap-3">
                {siteConfig.social.instagram && <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className={cn(linkStyle, 'transition-colors')}><Instagram className="h-5 w-5" /></a>}
                {siteConfig.social.facebook && <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className={cn(linkStyle, 'transition-colors')}><Facebook className="h-5 w-5" /></a>}
                {siteConfig.social.whatsapp && <a href={siteConfig.social.whatsapp} target="_blank" rel="noopener noreferrer" className={cn(linkStyle, 'transition-colors')}><FaWhatsapp className="h-5 w-5" /></a>}
              </div>
            </div>
            <div>
              <h4 className={cn('font-display text-sm uppercase tracking-wider mb-4', headingStyle)}>Quick Links</h4>
              <ul className="space-y-2 text-xs uppercase tracking-wider">
                {siteConfig.footer.quickLinks.map((link) => (
                  <li key={link.href}><Link to={link.href} className={cn(linkStyle, 'transition-colors')}>{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={cn('font-display text-sm uppercase tracking-wider mb-4', headingStyle)}>Support</h4>
              <ul className="space-y-2 text-xs uppercase tracking-wider">
                {siteConfig.footer.customerService.map((link) => (
                  <li key={link.href}><Link to={link.href} className={cn(linkStyle, 'transition-colors')}>{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={cn('font-display text-sm uppercase tracking-wider mb-4', headingStyle)}>Contact</h4>
              <ul className="space-y-3 text-xs uppercase tracking-wider">
                <li className="flex items-start gap-3"><MapPin className={cn('h-4 w-4 mt-0.5 flex-shrink-0', headingStyle)} /><span className={isDark ? 'text-background/70' : 'text-muted-foreground'}>{siteConfig.contact.address.full}</span></li>
                <li className="flex items-center gap-3"><Phone className={cn('h-4 w-4 flex-shrink-0', headingStyle)} /><a href={`tel:${siteConfig.contact.phone}`} className={cn(linkStyle, 'transition-colors')}>{siteConfig.contact.phone}</a></li>
                <li className="flex items-center gap-3"><Mail className={cn('h-4 w-4 flex-shrink-0', headingStyle)} /><a href={`mailto:${siteConfig.contact.email}`} className={cn(linkStyle, 'transition-colors')}>{siteConfig.contact.email}</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className={cn('border-t', isDark ? 'border-background/20' : 'border-border')}>
          <div className="container-tight py-6"><TrustBadges /></div>
        </div>
        <div className={cn('border-t', isDark ? 'border-background/20' : 'border-border')}>
          <div className="container-tight py-6">
            <p className={cn('text-center text-xs uppercase tracking-wider mb-4', isDark ? 'text-background/50' : 'text-muted-foreground')}>Secure Payments</p>
            <PaymentMethods />
          </div>
        </div>
        <div className={cn('border-t', isDark ? 'border-background/20' : 'border-border')}>
          <div className="container-tight py-6">
            <div className={cn('flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-wider', isDark ? 'text-background/50' : 'text-muted-foreground')}>
              <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {siteConfig.footer.legal.map((link) => (
                  <Link key={link.href} to={link.href} className={cn(linkStyle, 'transition-colors')}>{link.name}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {siteConfig.features.whatsappButton && (
        <a
          href={`${siteConfig.social.whatsapp}?text=${encodeURIComponent(siteConfig.whatsapp.defaultMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 bg-[#25D366] text-background p-4 border-2 border-foreground hover:scale-110 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <FaWhatsapp className="h-6 w-6" />
        </a>
      )}
    </footer>
  );
};

export default Footer;
