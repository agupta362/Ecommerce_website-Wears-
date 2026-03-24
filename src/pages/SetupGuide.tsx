import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Store, Palette, CreditCard, Settings, Download, 
  CheckCircle, ArrowRight, Monitor, Database, Globe, Key, 
  Image, Upload, ChevronDown, ChevronUp, FileCode, Truck,
  Layout, Eye, Copy, Server, Mail, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/seo/SEOHead';

const STORAGE_KEY = 'setup-guide-checklist';

const useChecklist = (totalItems: number) => {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = useCallback((id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const reset = useCallback(() => setChecked({}), []);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  return { checked, toggle, reset, completedCount, progress };
};

const steps = [
  {
    number: 0,
    title: 'Choose a Design Template',
    icon: Layout,
    badge: 'Step 0',
    description: 'Start by selecting one of 8 professionally designed templates — each with a unique layout architecture, navigation style, card design, and animation personality.',
    details: [
      'Navigate to **Admin Dashboard → Super Admin** and click **"New Store Setup"**',
      'Browse through 8 distinct template options:',
    ],
    templates: [
      { name: 'Brutalist Sports', desc: 'Thick borders, uppercase typography, raw energy — ideal for sports/streetwear stores' },
      { name: 'Elegant Atelier', desc: 'Serif fonts, muted gold palette, airy spacing — perfect for jewelry & luxury brands' },
      { name: 'Noir Minimal', desc: 'Ultra-clean monochrome, massive whitespace — works for any fashion store' },
      { name: 'Glassmorphism', desc: 'Frosted glass cards, indigo-violet gradients — great for tech & cosmetics' },
      { name: 'Warm Earth', desc: 'Organic terracotta warmth, rounded forms — ideal for cosmetics & organic brands' },
      { name: 'Neo Tokyo', desc: 'Cyberpunk energy, neon accents, terminal aesthetic — for streetwear & electronics' },
      { name: 'Scandi Clean', desc: 'Nordic minimalism, sage accents, calm feel — for general & home stores' },
      { name: 'Heritage Classic', desc: 'Navy & burgundy editorial typography — timeless craft & vintage feel' },
    ],
    extraDetails: [
      'Hover over any template card and click the **eye icon (👁)** to open a **full-page preview**',
      'Use the **tab bar** (Home, Shop, Product, Cart, Contact) inside the preview to see how the template looks across different pages',
      'You can also choose **"Start from Scratch"** to build a custom theme from the ground up',
      'Click a template card to select it, then click **"Next"** to proceed',
    ],
  },
  {
    number: 1,
    title: 'Enter Business Details',
    icon: Store,
    badge: 'Step 1',
    description: 'Fill in your business identity, contact information, and social media links. These populate the entire store — header, footer, contact page, WhatsApp buttons, and more.',
    details: [
      '**Store Name** — Your brand name (displayed in header, footer, invoices, and SEO)',
      '**Store Slug** — Auto-generated URL-safe identifier (used for localStorage keys to prevent data collision between stores)',
      '**Tagline** — Short description (used in hero section, SEO meta, and footer)',
      '**Domain/URL** — Your store\'s live URL (e.g., https://mystore.com)',
      '**Email** — Contact email (displayed on contact page and order confirmations)',
      '**Phone** — Display phone number and raw format for WhatsApp integration',
      '**Address** — Street, city, and country (used in footer, contact page, and invoices)',
      '**Social Media** — Instagram, Facebook, and TikTok URLs (footer social links)',
    ],
  },
  {
    number: 2,
    title: 'Configure Store Type & Theme',
    icon: Palette,
    badge: 'Step 2',
    description: 'Fine-tune the visual design. Your selected template pre-fills these values, but you can override any of them.',
    details: [
      '**Store Type** — Determines size options (S/M/L for clothing, ring sizes for jewelry), product filters, and loader animation',
      '**Font Style** — Choose from 8 typography pairings (each template has an optimal combination)',
      '**Border Radius** — From sharp (0px) to pill (16px) — controls the roundness of cards, buttons, and inputs',
      '**Primary Color** — Your main brand color in HSL (Hue, Saturation, Lightness) — used for headers, buttons, and emphasis',
      '**Accent Color** — Secondary brand color — used for CTAs, sale badges, and highlights',
      'A live color preview swatch updates as you adjust the HSL values',
    ],
  },
  {
    number: 3,
    title: 'Set Up Payment & Shipping',
    icon: CreditCard,
    badge: 'Step 3',
    description: 'Configure which payment methods are available and how shipping works for your store.',
    details: [
      '**Payment Methods** — Toggle Cash on Delivery, eSewa, Khalti, and Bank Transfer independently',
      'For eSewa/Khalti, enter the phone number where customers should send payments',
      '**Courier Provider** — Choose Nepal Can Move (NCM) for integrated shipping with tracking, or Custom/Manual',
      'If using NCM, enter your registered **source branch name** (e.g., NARAYANGHAT)',
      '**Default Shipping Cost** — Flat rate in NPR for standard delivery',
      '**Free Shipping Threshold** — Number of items after which shipping becomes free',
    ],
  },
  {
    number: 4,
    title: 'Review & Generate Configuration',
    icon: Settings,
    badge: 'Step 4',
    description: 'Review a summary of everything you\'ve configured. The wizard validates your inputs and shows a final overview before generating.',
    details: [
      'Review all your settings at a glance — business info, theme, payments, and shipping',
      'The **Order Number Prefix** is auto-generated from your store name initials (e.g., "My Store Nepal" → MSN)',
      'Click **"Generate & Register"** to create your configuration and register the store in the platform registry',
    ],
  },
];

const postWizardSteps = [
  {
    title: 'Download or Copy the Generated Config',
    icon: Download,
    description: 'After the wizard completes, you\'ll see the full auto-generated `site.config.ts` file. Use the **Copy** or **Download** button to save it.',
  },
  {
    title: 'Replace site.config.ts in Your Clone',
    icon: FileCode,
    description: 'Open your cloned project and replace the contents of `src/config/site.config.ts` with the generated configuration. This single file controls your entire store\'s identity.',
  },
  {
    title: 'Update Edge Function Config',
    icon: Server,
    description: 'Update `supabase/functions/_shared/config.ts` to match your store name, email, phone, and NCM branch settings — these power server-side logic like order notifications and shipping.',
  },
  {
    title: 'Replace Brand Assets',
    icon: Image,
    description: 'Swap the placeholder logo, favicon, OG image, hero banner, and video with your actual brand assets. See the asset size guide below.',
  },
  {
    title: 'Create a New Supabase Project',
    icon: Database,
    description: 'Create a fresh Supabase project, run all database migrations in order, and update `.env` with your new project URL and anon key.',
  },
  {
    title: 'Add Supabase Secrets',
    icon: Key,
    description: 'In Supabase Dashboard → Settings → Edge Functions → Secrets, add your `NCM_API_TOKEN` (from portal.nepalcanmove.com) and `RESEND_API_KEY` (from resend.com).',
  },
  {
    title: 'Deploy Edge Functions',
    icon: Upload,
    description: 'Deploy all edge functions using `supabase functions deploy` via the Supabase CLI, or they auto-deploy if using Lovable.',
  },
  {
    title: 'Connect a Custom Domain',
    icon: Globe,
    description: 'Point your domain to the deployed store and update auth redirect URLs in Supabase to match your new domain.',
  },
];

const assetSizes = [
  { file: 'public/placeholder-logo.svg', desc: 'Main logo', size: '200×60px (SVG preferred)' },
  { file: 'public/favicon.ico', desc: 'Browser tab icon', size: '32×32px' },
  { file: 'public/og-image.jpg', desc: 'Social sharing preview', size: '1200×630px' },
  { file: 'src/assets/hero-banner.jpg', desc: 'Hero background image', size: '1920×1080px' },
  { file: 'src/assets/video.mp4', desc: 'Hero background video', size: '1920×1080px (optional)' },
];

const SetupGuide = () => {
  const navigate = useNavigate();
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  
  const totalChecklistItems = steps.length + postWizardSteps.length;
  const { checked, toggle, reset, completedCount, progress } = useChecklist(totalChecklistItems);

  return (
    <>
      <SEOHead
        title="Store Setup Guide | How to Create a New Website"
        description="Step-by-step documentation for setting up a new e-commerce store using the Store Setup Wizard. Learn how to choose templates, configure payments, and deploy."
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-background">
        {/* Hero */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-16 md:py-24 text-center max-w-3xl">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" /> Documentation
            </Badge>
            <h1 className="text-3xl md:text-5xl font-display uppercase tracking-wider mb-4">
              New Store Setup Guide
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Everything you need to know about creating a new e-commerce store — from choosing a template to going live with a custom domain.
            </p>
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button onClick={() => navigate('/admin/super-admin')} size="lg">
                <Store className="h-4 w-4 mr-2" /> Open Setup Wizard
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.getElementById('wizard-steps')?.scrollIntoView({ behavior: 'smooth' })}>
                Read the Guide <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            {/* Progress Tracker */}
            <div className="mt-8 max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{completedCount} of {totalChecklistItems} steps complete</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {completedCount > 0 && (
                <Button variant="ghost" size="sm" className="mt-2 text-xs text-muted-foreground" onClick={reset}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset progress
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Overview */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <h2 className="text-2xl font-display uppercase tracking-wider mb-6">Overview</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The <strong>Store Setup Wizard</strong> is a guided multi-step process inside the Super Admin dashboard that takes you from zero to a fully configured store in minutes. It generates a complete <code className="bg-muted px-1.5 py-0.5 rounded text-sm">site.config.ts</code> file — the single source of truth that controls your entire store's identity, theme, payments, shipping, and features.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Monitor className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">8 Unique Templates</p>
                <p className="text-xs text-muted-foreground mt-1">Each with distinct layout, navigation, and animation personality</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">Multi-Page Preview</p>
                <p className="text-xs text-muted-foreground mt-1">Preview Home, Shop, Product, Cart & Contact before choosing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <FileCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">Auto-Generated Config</p>
                <p className="text-xs text-muted-foreground mt-1">One file controls everything — copy, paste, done</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Wizard Steps */}
        <section id="wizard-steps" className="container mx-auto px-4 py-12 max-w-4xl">
          <h2 className="text-2xl font-display uppercase tracking-wider mb-2">The Setup Wizard</h2>
          <p className="text-muted-foreground mb-8">5 steps inside the wizard, followed by deployment tasks.</p>

          <div className="space-y-4">
            {steps.map((step) => {
              const isExpanded = expandedStep === step.number;
              const Icon = step.icon;
              return (
                <Card key={step.number} className={`overflow-hidden transition-colors ${checked[`wizard-${step.number}`] ? 'border-primary/30 bg-primary/5' : ''}`}>
                  <div className="flex items-start">
                    <div className="pt-5 pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={!!checked[`wizard-${step.number}`]}
                        onCheckedChange={() => toggle(`wizard-${step.number}`)}
                      />
                    </div>
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                      className="w-full text-left flex-1"
                    >
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${checked[`wizard-${step.number}`] ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{step.badge}</Badge>
                          <CardTitle className="text-base">{step.title}</CardTitle>
                        </div>
                        <CardDescription className="mt-1">{step.description}</CardDescription>
                      </div>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                    </CardHeader>
                  </button>
                  </div>

                  {isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      <ul className="space-y-2 ml-14">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>') }} />
                          </li>
                        ))}
                      </ul>

                      {step.templates && (
                        <div className="ml-14 mt-4 grid sm:grid-cols-2 gap-2">
                          {step.templates.map((t) => (
                            <div key={t.name} className="flex gap-2 p-2 rounded-md bg-muted/50 text-sm">
                              <span className="font-semibold text-foreground whitespace-nowrap">{t.name}</span>
                              <span className="text-muted-foreground text-xs">— {t.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {step.extraDetails && (
                        <ul className="space-y-2 ml-14 mt-4">
                          {step.extraDetails.map((detail, i) => (
                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>') }} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Post-Wizard Steps */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <h2 className="text-2xl font-display uppercase tracking-wider mb-2">After the Wizard</h2>
          <p className="text-muted-foreground mb-8">Once you have the generated config file, follow these deployment steps to go live.</p>

          <div className="space-y-6">
            {postWizardSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-8 w-8 shrink-0">
                      <Checkbox
                        checked={!!checked[`post-${i}`]}
                        onCheckedChange={() => toggle(`post-${i}`)}
                      />
                    </div>
                    {i < postWizardSteps.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>
                  <div className={`pb-6 transition-opacity ${checked[`post-${i}`] ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className={`font-semibold text-sm ${checked[`post-${i}`] ? 'line-through' : ''}`}>{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: step.description.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Asset Sizes */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <h2 className="text-2xl font-display uppercase tracking-wider mb-6">Brand Asset Sizes</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-semibold">File</th>
                      <th className="text-left py-2 pr-4 font-semibold">Description</th>
                      <th className="text-left py-2 font-semibold">Recommended Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetSizes.map((asset) => (
                      <tr key={asset.file} className="border-b border-border/50">
                        <td className="py-2 pr-4"><code className="bg-muted px-1.5 py-0.5 rounded text-xs">{asset.file}</code></td>
                        <td className="py-2 pr-4 text-muted-foreground">{asset.desc}</td>
                        <td className="py-2 font-mono text-xs">{asset.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="max-w-4xl mx-auto" />

        {/* Quick Reference */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <h2 className="text-2xl font-display uppercase tracking-wider mb-6">Key Files Reference</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  <code className="text-sm font-semibold">src/config/site.config.ts</code>
                </div>
                <p className="text-xs text-muted-foreground">The main configuration file — controls store identity, theme, payments, shipping, SEO, navigation, features, and more. This is the file generated by the wizard.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-primary" />
                  <code className="text-sm font-semibold">supabase/functions/_shared/config.ts</code>
                </div>
                <p className="text-xs text-muted-foreground">Edge function configuration — must match site.config.ts settings for NCM branch, business name, email, and phone.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <code className="text-sm font-semibold">src/config/ThemeInjector.tsx</code>
                </div>
                <p className="text-xs text-muted-foreground">Reads theme colors from site.config.ts and injects them as CSS custom properties at runtime.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-primary" />
                  <code className="text-sm font-semibold">.env</code>
                </div>
                <p className="text-xs text-muted-foreground">Environment variables — Supabase URL, anon key, and project ID. Update for each new store clone.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
            <h2 className="text-2xl font-display uppercase tracking-wider mb-4">Ready to Create a Store?</h2>
            <p className="text-muted-foreground mb-8">Open the Super Admin dashboard and launch the setup wizard to get started.</p>
            <Button onClick={() => navigate('/admin/super-admin')} size="lg">
              <Sparkles className="h-4 w-4 mr-2" /> Launch Setup Wizard
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SetupGuide;
