import { Mail, Phone, MapPin, MessageCircle, Clock, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { toast } from 'sonner';
import { useState } from 'react';
import { checkRateLimit, getAnonymousIdentifier } from '@/hooks/useRateLimit';
import { siteConfig } from '@/config/site.config';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const identifier = formData.email.toLowerCase() || getAnonymousIdentifier();
      const rateLimitResult = await checkRateLimit('contact', identifier);

      if (!rateLimitResult.allowed) {
        toast.error(rateLimitResult.message || 'Too many messages. Please try again later.');
        return;
      }

      toast.success('Message sent! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { contact, social } = siteConfig;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-secondary py-12">
          <div className="container-tight">
            <PageBreadcrumbs 
              items={[{ label: 'Contact Us' }]} 
              className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
            />
            <h1 className="section-title text-secondary-foreground">Contact Us</h1>
            <p className="text-secondary-foreground/80 mt-2">
              We'd love to hear from you
            </p>
          </div>
        </section>

        <section className="container-tight py-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wider mb-6">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-8">
                Have questions about an order, sizing, or our products?
                We're here to help! Reach out through any of the channels below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-wider mb-1">Visit Us</h3>
                    <p className="text-muted-foreground">
                      {contact.address.street}, {contact.address.city}<br />
                      {contact.address.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-wider mb-1">Call Us</h3>
                    <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-wider mb-1">WhatsApp</h3>
                    <a
                      href={social.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-wider mb-1">Email</h3>
                    <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Instagram className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-wider mb-1">Instagram</h3>
                    <a
                      href={social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {social.instagramHandle}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display uppercase tracking-wider mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      {contact.businessHours.weekdays}<br />
                      {contact.businessHours.weekends}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card p-4 sm:p-8">
              <h2 className="font-display text-2xl uppercase tracking-wider mb-6">
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Order inquiry, Size question"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full btn-hero" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
