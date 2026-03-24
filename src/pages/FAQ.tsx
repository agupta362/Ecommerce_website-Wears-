import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { siteConfig } from '@/config/site.config';

const FAQ = () => {
  const faqs = siteConfig.faq;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-secondary py-12">
          <div className="container-tight">
            <PageBreadcrumbs 
              items={[{ label: 'FAQ' }]} 
              className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
            />
            <h1 className="section-title text-secondary-foreground">FAQ</h1>
            <p className="text-secondary-foreground/80 mt-2">
              Frequently Asked Questions
            </p>
          </div>
        </section>

        <section className="container-tight px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="max-w-3xl mx-auto">
            {faqs.map((category, idx) => (
              <div key={idx} className="mb-8">
                <h2 className="font-display text-lg uppercase tracking-wider mb-4 text-primary">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`${idx}-${faqIdx}`} className="bg-card rounded-lg px-4">
                      <AccordionTrigger className="text-left font-medium">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}

            <div className="text-center mt-12 p-8 bg-muted/50 rounded-lg">
              <h3 className="font-display text-xl uppercase tracking-wider mb-2">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our team is here to help!
              </p>
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Contact us →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
