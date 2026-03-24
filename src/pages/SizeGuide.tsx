import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { Ruler, Info } from 'lucide-react';
import { siteConfig } from '@/config/site.config';

const SizeGuide = () => {
  const sizeChart = [
    { size: 'S', chest: '92-96', waist: '76-80', height: '165-170' },
    { size: 'M', chest: '96-100', waist: '80-84', height: '170-175' },
    { size: 'L', chest: '100-104', waist: '84-88', height: '175-180' },
    { size: 'XL', chest: '104-108', waist: '88-92', height: '180-185' },
    { size: 'XXL', chest: '108-112', waist: '92-96', height: '185-190' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-secondary py-12">
          <div className="container-tight">
            <PageBreadcrumbs 
              items={[{ label: 'Size Guide' }]} 
              className="text-secondary-foreground/70 mb-4 [&_a]:text-secondary-foreground/70 [&_a:hover]:text-accent [&_span]:text-secondary-foreground"
            />
            <h1 className="section-title text-secondary-foreground">Size Guide</h1>
            <p className="text-secondary-foreground/80 mt-2">
              Find your perfect fit
            </p>
          </div>
        </section>

        <section className="container-tight px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto">
            {/* How to Measure */}
            <div className="bg-card p-4 sm:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Ruler className="h-6 w-6 text-primary" />
                <h2 className="font-display text-xl uppercase tracking-wider">
                  How to Measure
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Chest</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure around the fullest part of your chest, keeping the tape horizontal.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Waist</h3>
                  <p className="text-sm text-muted-foreground">
                    Measure around your natural waistline, keeping the tape comfortably loose.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Height</h3>
                  <p className="text-sm text-muted-foreground">
                    Your total height from head to toe without shoes.
                  </p>
                </div>
              </div>
            </div>

            {/* Size Chart */}
            <div className="bg-card p-4 sm:p-8 mb-8">
              <h2 className="font-display text-xl uppercase tracking-wider mb-6">
                Size Chart (cm)
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-display uppercase tracking-wider">Size</th>
                      <th className="text-left py-3 px-4 font-display uppercase tracking-wider">Chest</th>
                      <th className="text-left py-3 px-4 font-display uppercase tracking-wider">Waist</th>
                      <th className="text-left py-3 px-4 font-display uppercase tracking-wider">Height</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((row) => (
                      <tr key={row.size} className="border-b">
                        <td className="py-3 px-4 font-bold">{row.size}</td>
                        <td className="py-3 px-4">{row.chest}</td>
                        <td className="py-3 px-4">{row.waist}</td>
                        <td className="py-3 px-4">{row.height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-accent/10 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h3 className="font-medium mb-2">Sizing Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {siteConfig.sizeGuide.sizingTips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">
                Still unsure about your size? We're happy to help!
              </p>
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Contact us for sizing assistance →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SizeGuide;
