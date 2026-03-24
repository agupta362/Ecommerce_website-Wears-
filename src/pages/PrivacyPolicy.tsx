import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { siteConfig } from '@/config/site.config';

const PrivacyPolicy = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      <section className="bg-secondary py-12">
        <div className="container-tight">
          <PageBreadcrumbs 
            items={[{ label: 'Privacy Policy' }]} 
            className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
          />
          <h1 className="section-title text-secondary-foreground">Privacy Policy</h1>
        </div>
      </section>
      <section className="container-tight px-4 sm:px-6 lg:px-8 py-8 sm:py-16 prose prose-lg max-w-3xl mx-auto">
        <p>Last updated: January 2024</p>
        <h2>Information We Collect</h2>
        <p>We collect information you provide when placing orders: name, phone, email, and shipping address. This is used solely for order fulfillment and customer service.</p>
        <h2>How We Use Your Information</h2>
        <p>Your information is used to process orders, send shipping updates via WhatsApp/SMS, and improve our services. We never sell your data to third parties.</p>
        <h2>Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information.</p>
        <h2>Contact</h2>
        <p>For privacy questions, contact us at {siteConfig.contact.email}</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default PrivacyPolicy;
