import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { siteConfig } from '@/config/site.config';

const ShippingPolicy = () => {
  const { shippingPolicy } = siteConfig.legal;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-secondary py-12">
          <div className="container-tight">
            <PageBreadcrumbs 
              items={[{ label: 'Shipping Policy' }]} 
              className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
            />
            <h1 className="section-title text-secondary-foreground">Shipping Policy</h1>
          </div>
        </section>
        <section className="container-tight px-4 sm:px-6 lg:px-8 py-8 sm:py-16 prose prose-lg max-w-3xl mx-auto">
          {shippingPolicy.sections.map((s) => (
            <div key={s.heading}>
              <h2>{s.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: s.content }} />
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
