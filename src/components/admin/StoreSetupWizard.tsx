import { useState, useEffect, useMemo } from 'react';
import { ShopPagePreview, ProductPagePreview, CartPagePreview, ContactPagePreview } from './TemplatePagePreviews';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Download, Copy, Check, ChevronRight, ChevronLeft, Sparkles, Eye, X, ShoppingCart, Search, Heart, Star, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StoreSetupWizardProps {
  onComplete: () => void;
}

interface StoreData {
  // Step 1: Business
  storeName: string;
  tagline: string;
  domain: string;
  storeSlug: string;
  email: string;
  phone: string;
  phoneRaw: string;
  street: string;
  city: string;
  country: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  tiktok: string;
  // Step 2: Type & Theme
  storeType: string;
  primaryH: number;
  primaryS: number;
  primaryL: number;
  accentH: number;
  accentS: number;
  accentL: number;
  fontStyle: string;
  borderRadius: string;
  // Step 3: Payment & Shipping
  codEnabled: boolean;
  esewaEnabled: boolean;
  khaltiEnabled: boolean;
  bankEnabled: boolean;
  esewaPhone: string;
  khaltiPhone: string;
  courierProvider: string;
  sourceBranch: string;
  defaultShippingCost: number;
  freeShippingThreshold: number;
  // Step 4: Additional
  orderPrefix: string;
  heroType: string;
  loaderType: string;
}

const defaultData: StoreData = {
  storeName: '', tagline: '', domain: '', storeSlug: '', email: '', phone: '', phoneRaw: '',
  street: '', city: '', country: 'Nepal', instagram: '', facebook: '', whatsapp: '', tiktok: '',
  storeType: 'clothing', primaryH: 0, primaryS: 0, primaryL: 5, accentH: 68, accentS: 100, accentL: 50,
  fontStyle: 'brutalist', borderRadius: '0',
  codEnabled: true, esewaEnabled: true, khaltiEnabled: true, bankEnabled: true,
  esewaPhone: '', khaltiPhone: '', courierProvider: 'ncm', sourceBranch: '',
  defaultShippingCost: 150, freeShippingThreshold: 2, orderPrefix: '', heroType: 'video', loaderType: 'default',
};

import { templatePresets, fontPresets, type TemplatePreset } from './templatePresets';




// ============================================================================
// MINI PREVIEW COMPONENT — Each template has a unique silhouette
// ============================================================================

const TemplateMiniPreview = ({ template, fontFamily }: { template: TemplatePreset; fontFamily: string }) => {
  const { colors, borderRadius } = template;
  const accent = `hsl(${colors.accent.h}, ${colors.accent.s}%, ${colors.accent.l}%)`;
  const primary = `hsl(${colors.primary.h}, ${colors.primary.s}%, ${colors.primary.l}%)`;
  const r = borderRadius === '0' ? '0px' : borderRadius;

  const base: React.CSSProperties = {
    backgroundColor: colors.bg, color: colors.fg, fontFamily,
    fontSize: '6px', overflow: 'hidden', position: 'relative',
  };

  switch (template.id) {
    case 'brutalist-sports':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={base}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', backgroundColor: colors.fg, transform: 'skewX(-12deg)', transformOrigin: 'top right' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', borderBottom: `2px solid ${colors.fg}`, backgroundColor: colors.bg }}>
            <span style={{ fontWeight: 900, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>STORE</span>
            <div style={{ display: 'flex', gap: '6px', fontSize: '5px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.1em' }}>
              <span>Shop</span><span>New</span><span style={{ color: accent }}>Sale</span>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, padding: '6px' }}>
            <div style={{ fontWeight: 900, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 0.95 }}>NO<br/>RULES</div>
            <div style={{ marginTop: '2px', padding: '2px 6px', backgroundColor: accent, color: colors.bg, display: 'inline-block', fontSize: '5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>SHOP NOW</div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2px', padding: '0 4px 4px' }}>
            <div style={{ border: `2px solid ${colors.fg}`, aspectRatio: '1', backgroundColor: colors.mutedBg }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ border: `2px solid ${colors.fg}`, flex: 1, backgroundColor: colors.mutedBg }} />
              <div style={{ border: `2px solid ${colors.fg}`, flex: 1, backgroundColor: accent, opacity: 0.2 }} />
            </div>
          </div>
        </div>
      );

    case 'elegant-atelier':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={{ ...base, textAlign: 'center' }}>
          <div style={{ padding: '5px 0 3px', borderBottom: `0.5px solid ${colors.borderColor}` }}>
            <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', marginBottom: '2px' }}>ATELIER</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '5px', color: colors.mutedFg }}>
              <span>Shop</span><span>·</span><span>Collections</span><span>·</span><span>About</span>
            </div>
          </div>
          <div style={{ display: 'flex', height: '40%' }}>
            <div style={{ flex: 1, backgroundColor: colors.mutedBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `0.5px solid ${colors.borderColor}`, backgroundColor: accent, opacity: 0.3 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8px' }}>
              <div style={{ fontSize: '7px', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1.3 }}>Timeless<br/>Elegance</div>
              <div style={{ width: '16px', height: '0.5px', backgroundColor: accent, margin: '3px 0' }} />
              <div style={{ fontSize: '4px', color: colors.mutedFg, letterSpacing: '0.05em' }}>Discover the collection</div>
            </div>
          </div>
          <div style={{ padding: '4px 12px' }}>
            {[1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', borderBottom: `0.5px solid ${colors.borderColor}` }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: colors.mutedBg, flexShrink: 0 }} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '5px', fontWeight: 600 }}>Collection Piece</div>
                  <div style={{ fontSize: '5px', color: accent }}>Rs. {i * 1200}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'noir-minimal':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={base}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
              <div style={{ width: '10px', height: '1px', backgroundColor: colors.fg }} />
              <div style={{ width: '7px', height: '1px', backgroundColor: colors.fg }} />
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: `0.5px solid ${colors.fg}` }} />
          </div>
          <div style={{ padding: '12px 6px 4px', display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '28px', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 0.85 }}>Style.</span>
          </div>
          <div style={{ padding: '2px 6px', fontSize: '4px', color: colors.mutedFg, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll to explore ↓</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '6px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ aspectRatio: '1', backgroundColor: i === 2 ? colors.fg : colors.mutedBg, position: 'relative' }}>
                {i === 2 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.bg, fontSize: '5px', fontWeight: 600 }}>NEW</div>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={{ ...base, background: 'linear-gradient(135deg, #0f0a1f, #1a1040, #0f0a1f)' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, hsl(270,85%,65%,0.3), transparent 70%)`, filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, hsl(230,60%,45%,0.3), transparent 70%)`, filter: 'blur(8px)' }} />
          <div style={{ position: 'relative', zIndex: 2, margin: '4px 8px 0', padding: '3px 8px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '7px', fontWeight: 700, color: colors.fg }}>STORE</span>
            <div style={{ display: 'flex', gap: '4px', fontSize: '5px', color: 'rgba(255,255,255,0.6)' }}>
              <span>Shop</span><span>New</span>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: colors.fg, lineHeight: 1.2 }}>Discover<br/>Next Level</div>
              <div style={{ marginTop: '3px', padding: '2px 6px', borderRadius: '10px', backgroundColor: accent, color: '#fff', display: 'inline-block', fontSize: '4px', fontWeight: 600 }}>Explore</div>
            </div>
            <div style={{ width: '36px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.15)', transform: 'rotate(-3deg)', boxShadow: `0 4px 20px ${accent}20` }} />
            <div style={{ width: '32px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.1)', transform: 'rotate(5deg) translateY(4px)', position: 'absolute', right: '16px', top: '14px' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '4px', padding: '0 6px', marginTop: '2px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: '0.5px solid rgba(255,255,255,0.1)', padding: '3px', transform: `translateY(${i * 3}px)` }}>
                <div style={{ aspectRatio: '1', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
                <div style={{ padding: '2px 0', fontSize: '4px', color: 'rgba(255,255,255,0.7)' }}>Item</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'warm-earth':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={base}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 6px' }}>
            <span style={{ fontSize: '8px', fontWeight: 700 }}>earth</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {['Shop', 'New'].map(n => (
                <span key={n} style={{ fontSize: '4px', padding: '1px 4px', borderRadius: '20px', backgroundColor: colors.mutedBg, color: colors.fg }}>{n}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', padding: '4px 6px', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '40px', height: '40px', flexShrink: 0 }}>
              <div style={{ position: 'absolute', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: accent, opacity: 0.4, top: 0, left: 0 }} />
              <div style={{ position: 'absolute', width: '30px', height: '30px', borderRadius: '50%', backgroundColor: primary, opacity: 0.2, bottom: 0, right: 0 }} />
            </div>
            <div style={{ marginLeft: '6px' }}>
              <div style={{ fontSize: '8px', fontWeight: 700, lineHeight: 1.2 }}>Natural<br/>Beauty</div>
              <div style={{ fontSize: '4px', color: colors.mutedFg, marginTop: '1px' }}>Organic ingredients</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: 'auto auto', gap: '3px', padding: '3px 6px' }}>
            <div style={{ gridRow: '1 / 3', borderRadius: r, overflow: 'hidden', backgroundColor: colors.mutedBg, display: 'flex', alignItems: 'flex-end', padding: '3px' }}>
              <div style={{ fontSize: '5px', fontWeight: 600 }}>Featured</div>
            </div>
            <div style={{ borderRadius: r, backgroundColor: accent, opacity: 0.25, aspectRatio: '1.2' }} />
            <div style={{ borderRadius: r, backgroundColor: colors.mutedBg, aspectRatio: '1.2' }} />
          </div>
        </div>
      );

    case 'neo-tokyo':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={{ ...base, background: '#0a0a0f' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, backgroundColor: accent, padding: '1.5px 0', overflow: 'hidden', display: 'flex' }}>
            <span style={{ fontSize: '4px', color: '#0a0a0f', fontWeight: 700, letterSpacing: '0.15em', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>
              ★ NEW DROPS ★ FREE SHIPPING ★ LIMITED EDITION ★ NEW DROPS ★
            </span>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <span style={{ fontSize: '8px', fontWeight: 900, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase' }}>NEO</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['◉', '◎', '▣'].map((icon, i) => (
                <span key={i} style={{ fontSize: '7px', color: colors.mutedFg }}>{icon}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, padding: '6px', fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ fontSize: '4px', color: colors.mutedFg, marginBottom: '2px' }}>{'>'} INITIALIZING...</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 1, textShadow: `0 0 10px ${accent}60` }}>FUTURE<br/>IS NOW</div>
            <div style={{ marginTop: '2px', display: 'inline-block', padding: '1px 5px', border: `1px solid ${accent}`, color: accent, fontSize: '4px', letterSpacing: '0.2em' }}>ENTER →</div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', padding: '0 4px 4px', backgroundColor: colors.borderColor }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ aspectRatio: '1', backgroundColor: colors.cardBg, border: `1px solid ${i === 1 ? accent : colors.borderColor}`, position: 'relative' }}>
                {i === 1 && <div style={{ position: 'absolute', top: '1px', left: '1px', fontSize: '3px', color: accent, fontWeight: 700 }}>NEW</div>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'scandi-clean':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={base}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: `0.5px solid ${colors.borderColor}` }}>
            <span style={{ fontSize: '7px', fontWeight: 600, letterSpacing: '0.04em' }}>scandi</span>
            <div style={{ display: 'flex', gap: '6px', fontSize: '5px', color: colors.mutedFg, fontWeight: 300 }}>
              <span>shop</span><span>about</span>
            </div>
          </div>
          <div style={{ padding: '10px 8px 4px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.02em', color: colors.fg }}>Simple<br/>living.</div>
              <div style={{ marginTop: '3px', fontSize: '4px', color: colors.mutedFg }}>Curated essentials for everyday</div>
            </div>
            <div style={{ width: '28px', height: '34px', borderRadius: r, backgroundColor: colors.mutedBg, flexShrink: 0 }} />
          </div>
          <div style={{ padding: '6px 8px' }}>
            {[0,1].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', gap: '4px', marginBottom: '3px', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '22px', borderRadius: r, backgroundColor: colors.mutedBg, flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} />
                <div>
                  <div style={{ fontSize: '5px', fontWeight: 500 }}>Product name</div>
                  <div style={{ fontSize: '5px', color: accent }}>Rs. 1,200</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'heritage-classic':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={{ ...base, borderTop: `3px double ${colors.fg}` }}>
          <div style={{ textAlign: 'center', padding: '3px 6px 2px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>HERITAGE</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '4.5px', color: colors.mutedFg, marginTop: '1px', fontStyle: 'italic' }}>
              <span>Shop</span><span>·</span><span>Collections</span><span>·</span><span>About</span><span>·</span><span>Journal</span>
            </div>
          </div>
          <div style={{ padding: '4px 6px', borderBottom: `0.5px solid ${colors.borderColor}`, display: 'flex', gap: '6px' }}>
            <div style={{ flex: 1.5, backgroundColor: colors.mutedBg, borderRadius: r, minHeight: '36px', display: 'flex', alignItems: 'flex-end', padding: '3px' }}>
              <span style={{ fontSize: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured Story</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '7px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.02em' }}>The Art of<br/>Timeless Style</div>
              <div style={{ width: '12px', height: '0.5px', backgroundColor: accent, margin: '2px 0' }} />
              <div style={{ fontSize: '4px', color: colors.mutedFg, fontStyle: 'italic' }}>Read the full story →</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '4px 6px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRight: i < 3 ? `0.5px solid ${colors.borderColor}` : 'none', paddingRight: i < 3 ? '4px' : 0 }}>
                <div style={{ aspectRatio: '4/3', backgroundColor: colors.mutedBg, borderRadius: r, marginBottom: '2px' }} />
                <div style={{ fontSize: '5px', fontWeight: 700 }}>Collection {i}</div>
                <div style={{ fontSize: '4px', color: accent, fontStyle: 'italic' }}>Rs. {i * 900 + 500}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'daily-gazette':
      return (
        <div className="w-full aspect-[4/3] select-none pointer-events-none" style={{ ...base, backgroundColor: '#f5f0e8', color: '#1a1a18' }}>
          {/* Double rule top */}
          <div style={{ borderTop: '2px solid #1a1a18', borderBottom: '1px solid #1a1a18', height: '5px', margin: '0 4px' }} />
          {/* Masthead */}
          <div style={{ textAlign: 'center', padding: '2px 0 1px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', fontFamily: "'Lora', serif" }}>THE DAILY GAZETTE</div>
            <div style={{ fontSize: '3.5px', color: '#7a7568', letterSpacing: '0.1em' }}>Vol. XLII · No. 128 · Sunday Edition</div>
          </div>
          <div style={{ borderTop: '1px solid #1a1a18', borderBottom: '2px solid #1a1a18', height: '4px', margin: '0 4px' }} />
          {/* Section nav */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '2px 0', fontSize: '4px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a7568' }}>
            <span>News</span><span>·</span><span>Style</span><span>·</span><span>Sport</span><span>·</span><span>Shop</span>
          </div>
          {/* 3-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '0', padding: '3px 4px' }}>
            {/* Lead story */}
            <div style={{ borderRight: '0.5px solid #c8c0b0', paddingRight: '4px' }}>
              <div style={{ backgroundColor: '#ebe5d9', aspectRatio: '4/3', marginBottom: '2px' }} />
              <div style={{ fontSize: '7px', fontWeight: 700, lineHeight: 1.1, fontFamily: "'Lora', serif" }}>Headline Story Of The Day</div>
              <div style={{ fontSize: '3.5px', color: '#7a7568', marginTop: '1px', lineHeight: 1.3 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor...</div>
            </div>
            {/* Col 2 */}
            <div style={{ borderRight: '0.5px solid #c8c0b0', padding: '0 4px' }}>
              <div style={{ fontSize: '5.5px', fontWeight: 700, lineHeight: 1.1, fontFamily: "'Lora', serif", marginBottom: '2px' }}>Secondary Feature</div>
              <div style={{ fontSize: '3.5px', color: '#7a7568', lineHeight: 1.3, marginBottom: '3px' }}>Ut enim ad minim veniam, quis nostrud exercitation...</div>
              <div style={{ borderTop: '0.5px solid #c8c0b0', paddingTop: '2px', fontSize: '5px', fontWeight: 700, fontFamily: "'Lora', serif" }}>Style Report</div>
              <div style={{ fontSize: '3.5px', color: '#7a7568', lineHeight: 1.3 }}>Duis aute irure dolor in reprehenderit...</div>
            </div>
            {/* Col 3 - classifieds */}
            <div style={{ paddingLeft: '4px' }}>
              <div style={{ textAlign: 'center', fontSize: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '0.5px solid #c8c0b0', paddingBottom: '1px', marginBottom: '2px' }}>★ CLASSIFIEDS ★</div>
              {[1,2,3].map(i => (
                <div key={i} style={{ borderBottom: '0.5px solid #c8c0b0', paddingBottom: '2px', marginBottom: '2px' }}>
                  <div style={{ fontSize: '4px', fontWeight: 700 }}>Item #{i} — Rs. {i * 800 + 499}</div>
                  <div style={{ fontSize: '3px', color: '#7a7568' }}>Premium quality · Size S-XL</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return <div className="w-full aspect-[4/3] select-none pointer-events-none" style={base} />;
  }
};

// ============================================================================
// FULL-PAGE TEMPLATE PREVIEW — Each template has a unique full layout
// ============================================================================

type PreviewPage = 'home' | 'shop' | 'product' | 'cart' | 'contact';

const TemplateFullPreview = ({ template }: { template: TemplatePreset }) => {
  const [activePage, setActivePage] = useState<PreviewPage>('home');
  const { colors, borderRadius, fontStyle } = template;
  const fonts = fontPresets[fontStyle] || fontPresets.brutalist;
  const displayFont = fonts.display;
  const bodyFont = fonts.body;
  const accent = `hsl(${colors.accent.h}, ${colors.accent.s}%, ${colors.accent.l}%)`;
  const primary = `hsl(${colors.primary.h}, ${colors.primary.s}%, ${colors.primary.l}%)`;
  const r = borderRadius === '0' ? '0px' : borderRadius;

  const mockProducts = [
    { name: 'Premium Collection Piece', price: 2499 },
    { name: 'Signature Edition', price: 1899 },
    { name: 'Classic Essential', price: 1299 },
    { name: 'Limited Drop Item', price: 3499 },
    { name: 'Everyday Staple', price: 999 },
    { name: 'New Season Release', price: 2199 },
  ];

  const wrap: React.CSSProperties = { backgroundColor: colors.bg, color: colors.fg, fontFamily: bodyFont, minHeight: '600px', position: 'relative', overflow: 'hidden' };

  const pages: { id: PreviewPage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'product', label: 'Product' },
    { id: 'cart', label: 'Cart' },
    { id: 'contact', label: 'Contact' },
  ];

  const pageProps = { templateId: template.id, colors, displayFont, bodyFont, borderRadius };

  // Tab bar styled with the template's own design language
  const renderTabBar = () => {
    const isGlass = template.id === 'glassmorphism';
    const isNeo = template.id === 'neo-tokyo';
    const isDark = isGlass || isNeo;

    return (
      <div style={{
        display: 'flex',
        gap: isNeo ? '2px' : '0',
        borderBottom: isDark ? `1px solid ${colors.borderColor}` : `2px solid ${colors.fg}`,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.mutedBg,
        fontFamily: displayFont,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {pages.map(page => {
          const isActive = activePage === page.id;
          return (
            <button
              key={page.id}
              onClick={() => setActivePage(page.id)}
              style={{
                flex: 1,
                padding: isNeo ? '8px 0' : '10px 0',
                fontSize: isNeo ? '10px' : '11px',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                border: 'none',
                borderBottom: isActive
                  ? `3px solid ${isNeo || isGlass ? accent : colors.fg}`
                  : '3px solid transparent',
                backgroundColor: isActive
                  ? (isDark ? 'rgba(255,255,255,0.05)' : colors.bg)
                  : 'transparent',
                color: isActive
                  ? (isDark ? accent : colors.fg)
                  : (isDark ? colors.mutedFg : colors.mutedFg),
                cursor: 'pointer',
                fontFamily: displayFont,
                transition: 'all 0.2s ease',
                ...(isNeo && isActive ? { textShadow: `0 0 10px ${accent}60` } : {}),
              }}
            >
              {isNeo ? `[${page.label.toUpperCase()}]` : page.label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderHomePage = () => {
    switch (template.id) {
      case 'brutalist-sports':
        return (
          <div style={wrap} className="w-full">
            <div style={{ backgroundColor: colors.fg, color: colors.bg, padding: '8px 0', textAlign: 'center', fontSize: '11px', fontFamily: displayFont, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
              🔥 NO RULES JUST STYLE +++ FREE DELIVERY 2+ KITS +++ NEW DROPS WEEKLY
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '56px', borderBottom: `3px solid ${colors.fg}` }}>
              <span style={{ fontFamily: displayFont, fontWeight: 900, fontSize: '24px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>STORE</span>
              <div style={{ display: 'flex', gap: '24px', fontFamily: displayFont, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <span style={{ borderBottom: `3px solid ${colors.fg}`, paddingBottom: '2px' }}>Shop</span>
                <span>New</span><span style={{ color: accent }}>Sale</span><span>About</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}><Search size={20} /><ShoppingCart size={20} /></div>
            </div>
            <div style={{ position: 'relative', minHeight: '340px', backgroundColor: colors.mutedBg, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 0, top: 0, width: '45%', height: '100%', backgroundColor: colors.fg, transform: 'skewX(-12deg)', transformOrigin: 'top right' }} />
              <div style={{ position: 'relative', zIndex: 2, padding: '60px 40px', maxWidth: '55%' }}>
                <div style={{ fontFamily: displayFont, fontSize: '64px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 0.9 }}>NO<br/>RULES.</div>
                <div style={{ fontFamily: displayFont, fontSize: '64px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 0.9, WebkitTextStroke: `2px ${colors.fg}`, WebkitTextFillColor: 'transparent' } as React.CSSProperties}>JUST<br/>STYLE.</div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <span style={{ padding: '12px 32px', backgroundColor: accent, color: colors.bg, fontFamily: displayFont, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.15em', border: `3px solid ${colors.fg}` }}>SHOP NOW</span>
                  <span style={{ padding: '12px 32px', border: `3px solid ${colors.fg}`, fontFamily: displayFont, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>NEW DROPS</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '40px 24px' }}>
              <h2 style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>LATEST DROPS</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '4px' }}>
                {mockProducts.slice(0, 5).map((p, i) => (
                  <div key={i} style={{ gridRow: i === 0 ? '1 / 3' : undefined, border: `3px solid ${colors.fg}`, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: i === 0 ? '3/4' : '1', backgroundColor: colors.mutedBg, position: 'relative' }}>
                      {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: accent, color: colors.bg, padding: '4px 12px', fontFamily: displayFont, fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>NEW</div>}
                    </div>
                    <div style={{ padding: '10px 12px', borderTop: `3px solid ${colors.fg}` }}>
                      <div style={{ fontFamily: displayFont, fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.name}</div>
                      <div style={{ fontFamily: bodyFont, fontSize: '14px', fontWeight: 700, color: accent, marginTop: '2px' }}>Rs. {p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `3px solid ${colors.fg}`, borderBottom: `3px solid ${colors.fg}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {[{ e: '🚚', t: 'FREE SHIPPING' }, { e: '🔒', t: 'SECURE PAY' }, { e: '↩️', t: 'EASY RETURNS' }, { e: '💬', t: '24/7 SUPPORT' }].map((f, i) => (
                <div key={i} style={{ padding: '16px', textAlign: 'center', borderRight: i < 3 ? `3px solid ${colors.fg}` : 'none' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{f.e}</div>
                  <div style={{ fontFamily: displayFont, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{f.t}</div>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: colors.fg, color: colors.bg, padding: '32px 24px 16px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>STORE</div>
              <div style={{ fontSize: '11px', opacity: 0.5, fontFamily: bodyFont }}>© 2026 — All rights reserved. No rules. Just style.</div>
            </div>
          </div>
        );

      case 'elegant-atelier':
        return (
          <div style={{ ...wrap, textAlign: 'center' }} className="w-full">
            <div style={{ backgroundColor: colors.mutedBg, padding: '6px 0', fontSize: '10px', fontFamily: bodyFont, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.mutedFg }}>
              Complimentary Shipping on Orders Over Rs. 5,000
            </div>
            <div style={{ borderBottom: `0.5px solid ${colors.borderColor}`, padding: '16px 0 12px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '8px' }}>ATELIER</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontFamily: bodyFont, fontSize: '12px', color: colors.mutedFg, letterSpacing: '0.08em' }}>
                <span>Shop</span><span style={{ opacity: 0.3 }}>·</span><span>Collections</span><span style={{ opacity: 0.3 }}>·</span><span>Bespoke</span><span style={{ opacity: 0.3 }}>·</span><span>About</span>
              </div>
            </div>
            <div style={{ display: 'flex', minHeight: '320px' }}>
              <div style={{ flex: 1, backgroundColor: colors.mutedBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `0.5px solid ${colors.borderColor}`, backgroundColor: accent, opacity: 0.2 }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                <div style={{ fontFamily: bodyFont, fontSize: '11px', color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '12px' }}>Spring Collection 2026</div>
                <div style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.2, marginBottom: '16px' }}>Timeless<br/>Elegance,<br/>Redefined</div>
                <div style={{ width: '40px', height: '0.5px', backgroundColor: accent, marginBottom: '16px' }} />
                <div style={{ fontFamily: bodyFont, fontSize: '13px', color: colors.mutedFg, lineHeight: 1.6, maxWidth: '280px', marginBottom: '24px' }}>Each piece is a testament to the enduring beauty of masterful craftsmanship.</div>
                <span style={{ padding: '10px 36px', border: `0.5px solid ${colors.fg}`, fontFamily: bodyFont, fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Discover</span>
              </div>
            </div>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '48px 24px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '22px', letterSpacing: '0.1em', marginBottom: '32px' }}>Curated For You</div>
              {mockProducts.slice(0, 4).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px 0', borderBottom: `0.5px solid ${colors.borderColor}`, textAlign: 'left' }}>
                  <div style={{ width: '80px', height: '100px', backgroundColor: colors.mutedBg, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 700, letterSpacing: '0.03em', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontFamily: bodyFont, fontSize: '12px', color: colors.mutedFg, marginBottom: '8px' }}>Handcrafted with the finest materials</div>
                    <div style={{ fontFamily: bodyFont, fontSize: '14px', color: accent }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                  <Heart size={16} style={{ color: colors.mutedFg, flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <div style={{ borderTop: `0.5px solid ${colors.borderColor}`, padding: '32px 24px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: '18px', letterSpacing: '0.15em', marginBottom: '12px' }}>ATELIER</div>
              <div style={{ fontFamily: bodyFont, fontSize: '10px', color: colors.mutedFg, letterSpacing: '0.1em' }}>© 2026 — Crafted with care</div>
            </div>
          </div>
        );

      case 'noir-minimal':
        return (
          <div style={wrap} className="w-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '1.5px', backgroundColor: colors.fg }} />
                <div style={{ width: '14px', height: '1.5px', backgroundColor: colors.fg }} />
              </div>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${colors.fg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCart size={14} />
              </div>
            </div>
            <div style={{ padding: '80px 32px 24px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '96px', fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 0.85 }}>Style.</div>
              <div style={{ fontFamily: bodyFont, fontSize: '12px', color: colors.mutedFg, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '16px' }}>Scroll to explore ↓</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {mockProducts.map((p, i) => (
                <div key={i} style={{ aspectRatio: '3/4', backgroundColor: i % 2 === 0 ? colors.mutedBg : colors.cardBg, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: '#fff' }}>
                    <div style={{ fontFamily: displayFont, fontSize: '13px', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontFamily: bodyFont, fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                  {i === 0 && <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: colors.fg, color: colors.bg, padding: '3px 10px', fontSize: '9px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>New</div>}
                </div>
              ))}
            </div>
            <div style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: '11px', letterSpacing: '0.15em', color: colors.mutedFg, textTransform: 'uppercase' }}>© 2026</div>
            </div>
          </div>
        );

      case 'glassmorphism':
        return (
          <div style={{ ...wrap, background: 'linear-gradient(135deg, #0f0a1f, #1a1040, #0f0a1f)' }} className="w-full">
            <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, hsl(270,85%,65%,0.25), transparent 70%)`, filter: 'blur(40px)' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '45%', height: '45%', borderRadius: '50%', background: `radial-gradient(circle, hsl(230,60%,45%,0.25), transparent 70%)`, filter: 'blur(40px)' }} />
            <div style={{ position: 'relative', zIndex: 2, margin: '16px 24px 0', padding: '10px 24px', borderRadius: '50px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: displayFont, fontSize: '18px', fontWeight: 700, color: colors.fg }}>STORE</span>
              <div style={{ display: 'flex', gap: '24px', fontFamily: bodyFont, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                <span>Shop</span><span>New</span><span style={{ color: accent }}>Sale</span><span>About</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}><Search size={16} style={{ color: 'rgba(255,255,255,0.5)' }} /><ShoppingCart size={16} style={{ color: 'rgba(255,255,255,0.5)' }} /></div>
            </div>
            <div style={{ position: 'relative', zIndex: 2, padding: '60px 40px', display: 'flex', alignItems: 'center', gap: '48px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: bodyFont, fontSize: '11px', color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>New Collection</div>
                <div style={{ fontFamily: displayFont, fontSize: '42px', fontWeight: 700, lineHeight: 1.1, color: colors.fg, marginBottom: '16px' }}>Discover the<br/>Next Level</div>
                <div style={{ fontFamily: bodyFont, fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '380px', marginBottom: '24px' }}>Where innovation meets elegance.</div>
                <span style={{ padding: '12px 32px', borderRadius: '50px', background: `linear-gradient(135deg, ${accent}, hsl(${colors.accent.h + 30}, ${colors.accent.s}%, ${colors.accent.l}%))`, color: '#fff', fontFamily: displayFont, fontWeight: 600, fontSize: '13px' }}>Explore Now</span>
              </div>
              <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: '180px', height: '220px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', border: '0.5px solid rgba(255,255,255,0.12)', top: '10px', left: '10px', transform: 'rotate(-6deg)', boxShadow: `0 8px 32px ${accent}15` }} />
                <div style={{ position: 'absolute', width: '180px', height: '220px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)', border: '0.5px solid rgba(255,255,255,0.15)', top: '30px', right: '10px', transform: 'rotate(4deg)', boxShadow: `0 8px 32px ${accent}20` }} />
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 2, padding: '20px 40px 40px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '22px', fontWeight: 600, color: colors.fg, marginBottom: '24px' }}>Featured Products</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {mockProducts.map((p, i) => (
                  <div key={i} style={{ borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.1)', overflow: 'hidden', transform: `translateY(${i % 2 === 0 ? 0 : 16}px)` }}>
                    <div style={{ aspectRatio: '4/5', background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))', position: 'relative' }}>
                      {i === 0 && <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: accent, color: '#fff', padding: '3px 10px', borderRadius: '20px', fontSize: '9px', fontWeight: 600 }}>New</div>}
                    </div>
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: colors.fg }}>{p.name}</div>
                      <div style={{ fontSize: '14px', color: accent, fontWeight: 700, marginTop: '4px' }}>Rs. {p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 2, borderTop: '0.5px solid rgba(255,255,255,0.1)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: displayFont, fontSize: '14px', color: colors.fg }}>STORE</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>© 2026</span>
            </div>
          </div>
        );

      case 'warm-earth':
        return (
          <div style={wrap} className="w-full">
            <div style={{ backgroundColor: primary, color: '#fff', padding: '6px 0', textAlign: 'center', fontSize: '11px', fontFamily: bodyFont }}>
              🌿 Organic & Natural — Free Shipping on Rs. 3,000+
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <span style={{ fontFamily: displayFont, fontSize: '22px', fontWeight: 700 }}>earth</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Shop', 'New', 'Bestsellers', 'About'].map(n => (
                  <span key={n} style={{ fontSize: '12px', padding: '4px 14px', borderRadius: '20px', backgroundColor: n === 'Shop' ? colors.fg : colors.mutedBg, color: n === 'Shop' ? colors.bg : colors.fg, fontFamily: bodyFont, fontWeight: 500 }}>{n}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}><Search size={18} style={{ color: colors.mutedFg }} /><ShoppingCart size={18} style={{ color: colors.mutedFg }} /></div>
            </div>
            <div style={{ position: 'relative', padding: '60px 40px', display: 'flex', alignItems: 'center', gap: '48px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '10%', width: '300px', height: '300px', borderRadius: '60% 40% 50% 50%', backgroundColor: accent, opacity: 0.15, transform: 'rotate(-15deg)' }} />
              <div style={{ position: 'relative', width: '250px', height: '250px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: accent, opacity: 0.3, top: 0, left: 0 }} />
                <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', backgroundColor: primary, opacity: 0.15, bottom: 0, right: 0 }} />
              </div>
              <div style={{ position: 'relative', zIndex: 2, flex: 1 }}>
                <div style={{ fontFamily: displayFont, fontSize: '40px', fontWeight: 700, lineHeight: 1.1, marginBottom: '16px' }}>Natural Beauty,<br/>Organic Care</div>
                <div style={{ fontFamily: bodyFont, fontSize: '14px', color: colors.mutedFg, lineHeight: 1.6, maxWidth: '360px', marginBottom: '24px' }}>Pure ingredients for radiant skin.</div>
                <span style={{ padding: '10px 28px', borderRadius: '50px', backgroundColor: primary, color: '#fff', fontFamily: bodyFont, fontWeight: 600, fontSize: '13px' }}>Shop Now</span>
              </div>
            </div>
            <div style={{ padding: '40px 24px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '24px', marginBottom: '24px' }}>Bestsellers</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: 'auto auto', gap: '12px' }}>
                <div style={{ gridRow: '1 / 3', borderRadius: r, overflow: 'hidden', backgroundColor: colors.mutedBg, position: 'relative', aspectRatio: '3/4' }}>
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                    <div style={{ fontFamily: displayFont, fontSize: '18px', fontWeight: 700 }}>{mockProducts[0].name}</div>
                    <div style={{ fontSize: '14px', color: primary, fontWeight: 600 }}>Rs. {mockProducts[0].price.toLocaleString()}</div>
                  </div>
                </div>
                {mockProducts.slice(1, 3).map((p, i) => (
                  <div key={i} style={{ borderRadius: r, backgroundColor: colors.mutedBg, padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: r, backgroundColor: accent, opacity: 0.2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: primary, fontWeight: 600 }}>Rs. {p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: colors.fg, color: colors.bg, padding: '32px 24px 16px', borderRadius: `${r} ${r} 0 0` }}>
              <div style={{ fontFamily: displayFont, fontSize: '18px', marginBottom: '4px' }}>earth</div>
              <div style={{ fontSize: '10px', opacity: 0.5 }}>© 2026 — Nature-inspired beauty</div>
            </div>
          </div>
        );

      case 'neo-tokyo':
        return (
          <div style={{ ...wrap, background: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace" }} className="w-full">
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)', zIndex: 1, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 2, backgroundColor: accent, padding: '4px 0', overflow: 'hidden', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#0a0a0f', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>★ NEW DROPS EVERY FRIDAY ★ FREE SHIPPING ★ LIMITED EDITION ★</span>
            </div>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 900, color: accent, letterSpacing: '0.2em', textShadow: `0 0 20px ${accent}60` }}>NEO</span>
              <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: colors.mutedFg }}>
                <span>◉</span><span>◎</span><span>▣</span><span>☰</span>
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 2, padding: '48px 32px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <div style={{ fontSize: '11px', color: colors.mutedFg, marginBottom: '8px' }}>{'>'} SYSTEM.INITIALIZE_STORE()</div>
              <div style={{ fontSize: '12px', color: accent, marginBottom: '4px' }}>{'>'} LOADING COLLECTION...</div>
              <div style={{ fontFamily: displayFont, fontSize: '72px', fontWeight: 900, color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', lineHeight: 0.9, textShadow: `0 0 30px ${accent}40`, marginTop: '16px' }}>FUTURE<br/>IS NOW</div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <span style={{ padding: '10px 24px', border: `1px solid ${accent}`, color: accent, fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', boxShadow: `0 0 15px ${accent}30` }}>ENTER →</span>
                <span style={{ padding: '10px 24px', border: `1px solid ${colors.borderColor}`, color: colors.mutedFg, fontSize: '12px', letterSpacing: '0.1em' }}>CATALOG</span>
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 2, padding: '32px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontFamily: displayFont, fontSize: '20px', color: colors.fg, letterSpacing: '0.1em' }}>LATEST_DROPS</span>
                <span style={{ fontSize: '10px', color: accent }}>VIEW_ALL →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px' }}>
                {mockProducts.slice(0, 4).map((p, i) => (
                  <div key={i} style={{ backgroundColor: colors.cardBg, border: `1px solid ${i === 0 ? accent : colors.borderColor}`, overflow: 'hidden' }}>
                    <div style={{ aspectRatio: '1', background: `linear-gradient(180deg, ${colors.mutedBg}, ${colors.cardBg})`, position: 'relative' }}>
                      {i === 0 && <div style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: accent, color: '#0a0a0f', padding: '2px 8px', fontSize: '8px', fontWeight: 700 }}>NEW</div>}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: accent, boxShadow: `0 0 8px ${accent}60` }} />
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: '10px', color: colors.fg, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: accent, fontWeight: 700, marginTop: '4px', textShadow: `0 0 8px ${accent}40` }}>Rs.{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 2, borderTop: `1px solid ${colors.borderColor}`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: displayFont, fontSize: '14px', color: accent }}>NEO</span>
              <span style={{ fontSize: '9px', color: colors.mutedFg }}>© 2026 // ALL_RIGHTS_RESERVED</span>
            </div>
          </div>
        );

      case 'scandi-clean':
        return (
          <div style={wrap} className="w-full">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <span style={{ fontFamily: displayFont, fontSize: '18px', fontWeight: 600 }}>scandi</span>
              <div style={{ display: 'flex', gap: '28px', fontFamily: bodyFont, fontSize: '13px', color: colors.mutedFg, fontWeight: 300 }}>
                <span>shop</span><span>new</span><span>about</span><span>contact</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}><Search size={16} style={{ color: colors.mutedFg }} /><ShoppingCart size={16} style={{ color: colors.mutedFg }} /></div>
            </div>
            <div style={{ padding: '80px 40px 40px', display: 'flex', alignItems: 'flex-end', gap: '48px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: displayFont, fontSize: '64px', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.03em' }}>Simple<br/>living.</div>
                <div style={{ fontFamily: bodyFont, fontSize: '14px', color: colors.mutedFg, marginTop: '20px', lineHeight: 1.6, maxWidth: '340px' }}>Curated essentials for a mindful everyday.</div>
                <span style={{ display: 'inline-block', marginTop: '24px', padding: '10px 28px', borderRadius: r, backgroundColor: colors.fg, color: colors.bg, fontFamily: bodyFont, fontSize: '12px', fontWeight: 500 }}>Explore</span>
              </div>
              <div style={{ width: '240px', height: '300px', borderRadius: r, backgroundColor: colors.mutedBg, flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
            <div style={{ padding: '48px 40px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '22px', fontWeight: 500, marginBottom: '32px' }}>Featured</div>
              {mockProducts.slice(0, 4).map((p, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', gap: '24px', marginBottom: '24px', alignItems: 'center' }}>
                  <div style={{ width: '200px', height: '150px', borderRadius: r, backgroundColor: colors.mutedBg, flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} />
                  <div>
                    <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontFamily: bodyFont, fontSize: '12px', color: colors.mutedFg, marginTop: '4px' }}>Thoughtfully designed</div>
                    <div style={{ fontSize: '14px', color: accent, fontWeight: 600, marginTop: '8px' }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${colors.borderColor}`, padding: '24px 40px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 500 }}>scandi</span>
              <span style={{ fontSize: '10px', color: colors.mutedFg }}>© 2026</span>
            </div>
          </div>
        );

      case 'heritage-classic':
        return (
          <div style={{ ...wrap, borderTop: `4px double ${colors.fg}` }} className="w-full">
            <div style={{ textAlign: 'center', padding: '20px 0 12px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <div style={{ fontFamily: displayFont, fontSize: '32px', fontWeight: 700, letterSpacing: '0.08em' }}>HERITAGE</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', fontFamily: bodyFont, fontSize: '12px', color: colors.mutedFg, marginTop: '8px', fontStyle: 'italic' }}>
                <span>Shop</span><span style={{ opacity: 0.3 }}>·</span><span>Collections</span><span style={{ opacity: 0.3 }}>·</span><span>About</span><span style={{ opacity: 0.3 }}>·</span><span>Journal</span>
              </div>
            </div>
            <div style={{ display: 'flex', minHeight: '300px', borderBottom: `1px solid ${colors.borderColor}` }}>
              <div style={{ flex: 1.5, backgroundColor: colors.mutedBg, display: 'flex', alignItems: 'flex-end', padding: '24px' }}>
                <div>
                  <div style={{ fontFamily: bodyFont, fontSize: '10px', color: accent, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '4px' }}>Featured Story</div>
                  <div style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 700, lineHeight: 1.2 }}>The Art of Timeless Style</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 40px', borderLeft: `1px solid ${colors.borderColor}` }}>
                <div style={{ fontFamily: bodyFont, fontSize: '10px', color: accent, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px' }}>Since 1987</div>
                <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, lineHeight: 1.2, marginBottom: '16px' }}>Crafted with Purpose</div>
                <div style={{ width: '30px', height: '1px', backgroundColor: accent, marginBottom: '16px' }} />
                <div style={{ fontFamily: bodyFont, fontSize: '13px', color: colors.mutedFg, lineHeight: 1.7, fontStyle: 'italic', marginBottom: '20px' }}>Every piece tells a story of heritage.</div>
                <span style={{ alignSelf: 'flex-start', padding: '8px 24px', border: `1px solid ${colors.fg}`, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Read More</span>
              </div>
            </div>
            <div style={{ padding: '40px 32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontFamily: displayFont, fontSize: '22px', letterSpacing: '0.06em' }}>The Collection</div>
                <div style={{ width: '40px', height: '1px', backgroundColor: accent, margin: '8px auto' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {mockProducts.map((p, i) => (
                  <div key={i} style={{ borderRight: i < 2 ? `0.5px solid ${colors.borderColor}` : 'none', paddingRight: i < 2 ? '24px' : 0 }}>
                    <div style={{ aspectRatio: '4/5', backgroundColor: colors.mutedBg, borderRadius: r, marginBottom: '12px' }} />
                    <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{p.name}</div>
                    <div style={{ fontFamily: bodyFont, fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic', marginBottom: '4px' }}>Handcrafted excellence</div>
                    <div style={{ fontSize: '13px', color: accent, fontWeight: 600 }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: `2px double ${colors.fg}`, padding: '32px', textAlign: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: '18px', letterSpacing: '0.08em', marginBottom: '8px' }}>HERITAGE</div>
              <div style={{ fontFamily: bodyFont, fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic' }}>© 2026 — A legacy of craftsmanship</div>
            </div>
          </div>
        );

      case 'daily-gazette':
        return (
          <div style={{ ...wrap, backgroundColor: colors.bg, fontFamily: bodyFont }} className="w-full">
            {/* Double-rule masthead */}
            <div style={{ borderTop: '3px solid ' + colors.fg, borderBottom: '1px solid ' + colors.fg, height: '6px', margin: '0 24px' }} />
            <div style={{ textAlign: 'center', padding: '12px 0 8px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '48px', fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1 }}>THE DAILY GAZETTE</div>
              <div style={{ fontSize: '11px', color: colors.mutedFg, letterSpacing: '0.15em', marginTop: '4px' }}>Vol. XLII · No. 128 · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · Price Rs. 25</div>
            </div>
            <div style={{ borderTop: '1px solid ' + colors.fg, borderBottom: '3px solid ' + colors.fg, height: '6px', margin: '0 24px' }} />
            {/* Section nav */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', padding: '10px 0', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.mutedFg, borderBottom: '0.5px solid ' + colors.borderColor }}>
              <span style={{ color: accent, fontWeight: 700 }}>Front Page</span>
              <span>Style</span><span>Sport</span><span>Shop</span><span>Classifieds</span><span>Letters</span>
            </div>
            {/* Above the fold */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '0', padding: '24px', borderBottom: '1px solid ' + colors.borderColor }}>
              <div style={{ borderRight: '1px solid ' + colors.borderColor, paddingRight: '24px' }}>
                <div style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 700, lineHeight: 1.1, marginBottom: '12px' }}>Breaking: New Collection Drops Today — Fans Queue Since Dawn</div>
                <div style={{ fontSize: '12px', color: colors.mutedFg, fontStyle: 'italic', marginBottom: '12px' }}>By Our Fashion Desk · 8 min read</div>
                <div style={{ backgroundColor: colors.mutedBg, aspectRatio: '16/9', marginBottom: '8px' }} />
                <div style={{ fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic' }}>Excited shoppers outside the flagship store at dawn. Photo: Staff</div>
                <div style={{ fontSize: '13px', color: colors.fg, lineHeight: 1.7, marginTop: '12px', columnCount: 2, columnGap: '16px', columnRule: '0.5px solid ' + colors.borderColor }}>
                  <span style={{ fontSize: '32px', fontFamily: displayFont, fontWeight: 700, float: 'left', lineHeight: 0.85, marginRight: '4px', marginTop: '2px' }}>T</span>
                  he highly anticipated new collection launched today to unprecedented demand. Fashion enthusiasts lined up outside stores nationwide, with some arriving before dawn. The collection features a bold mix of heritage-inspired designs with modern sensibilities, marking a significant departure from previous seasons. Industry analysts predict record sales figures for the opening weekend.
                </div>
              </div>
              {/* Sidebar stories */}
              <div style={{ paddingLeft: '24px' }}>
                <div style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>Style Report: The Return of Classic Cuts</div>
                <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 1.6, marginBottom: '16px' }}>Fashion editors weigh in on this season's most surprising trend — the triumphant return of tailored silhouettes and structured shoulders.</div>
                <div style={{ borderTop: '0.5px solid ' + colors.borderColor, paddingTop: '12px', marginBottom: '16px' }}>
                  <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 700, lineHeight: 1.2, marginBottom: '4px' }}>Weekend Sport: Kit Launch Breaks Records</div>
                  <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 1.6 }}>The new home kit sold out within hours of going on sale, setting a new record for the club's merchandise division.</div>
                </div>
                <div style={{ borderTop: '0.5px solid ' + colors.borderColor, paddingTop: '12px' }}>
                  <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 700, lineHeight: 1.2, marginBottom: '4px' }}>Opinion: Why Quality Still Matters</div>
                  <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 1.6 }}>In an age of fast fashion, investing in well-made pieces remains the wisest choice for both your wardrobe and the planet.</div>
                </div>
              </div>
            </div>
            {/* Trending section */}
            <div style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.mutedFg }}>★ TRENDING THIS WEEK ★</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
                {mockProducts.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ borderRight: i < 2 ? '1px solid ' + colors.borderColor : 'none', padding: i === 0 ? '0 16px 0 0' : i === 2 ? '0 0 0 16px' : '0 16px' }}>
                    <div style={{ backgroundColor: colors.mutedBg, aspectRatio: '4/5', marginBottom: '8px' }} />
                    <div style={{ fontFamily: displayFont, fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic', marginBottom: '4px' }}>By Our Style Desk · 2 min read</div>
                    <div style={{ fontSize: '14px', color: accent, fontWeight: 700 }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Classifieds footer */}
            <div style={{ borderTop: '2px solid ' + colors.fg, margin: '0 24px', padding: '16px 0' }}>
              <div style={{ textAlign: 'center', fontFamily: displayFont, fontSize: '14px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>CLASSIFIEDS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0' }}>
                {mockProducts.slice(0, 4).map((p, i) => (
                  <div key={i} style={{ borderRight: i < 3 ? '0.5px solid ' + colors.borderColor : 'none', padding: '0 12px', fontSize: '11px' }}>
                    <span style={{ fontWeight: 700 }}>{p.name}</span> — Rs. {p.price.toLocaleString()}. Premium quality. All sizes available. <span style={{ color: accent, fontWeight: 600 }}>Order today.</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer */}
            <div style={{ borderTop: '3px double ' + colors.fg, margin: '16px 24px 0', padding: '16px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: '16px', letterSpacing: '0.06em' }}>THE DAILY GAZETTE</div>
              <div style={{ fontSize: '10px', color: colors.mutedFg, marginTop: '4px' }}>© 2026 — All Rights Reserved — Printed in Kathmandu</div>
            </div>
          </div>
        );

      default:
        return <div style={wrap} className="w-full" />;
    }
  };

  return (
    <div className="w-full">
      {renderTabBar()}
      {activePage === 'home' && renderHomePage()}
      {activePage === 'shop' && <ShopPagePreview {...pageProps} />}
      {activePage === 'product' && <ProductPagePreview {...pageProps} />}
      {activePage === 'cart' && <CartPagePreview {...pageProps} />}
      {activePage === 'contact' && <ContactPagePreview {...pageProps} />}
    </div>
  );
};

// ============================================================================
// TEMPLATE CARD COMPONENT
// ============================================================================

const TemplateCard = ({
  template,
  isSelected,
  onSelect,
  onPreview,
  fontFamily,
}: {
  template: TemplatePreset;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  fontFamily: string;
}) => {
  const accentColor = `hsl(${template.colors.accent.h}, ${template.colors.accent.s}%, ${template.colors.accent.l}%)`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden text-left transition-all duration-300 hover:scale-[1.02]"
      style={{
        border: isSelected ? `2px solid ${accentColor}` : '2px solid hsl(var(--border))',
        borderRadius: '0.5rem',
        background: 'hsl(var(--card))',
      }}
    >
      {isSelected && (
        <div
          className="absolute top-2 right-2 z-20 flex items-center justify-center rounded-full"
          style={{ width: '20px', height: '20px', backgroundColor: accentColor, color: template.colors.bg }}
        >
          <Check className="h-3 w-3" />
        </div>
      )}

      {/* Preview button */}
      <div
        className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={(e) => { e.stopPropagation(); onPreview(); }}
        style={{
          width: '24px', height: '24px',
          backgroundColor: 'hsl(var(--background) / 0.9)',
          border: '1px solid hsl(var(--border))',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Eye className="h-3 w-3 text-foreground" />
      </div>

      <div className="w-full overflow-hidden" style={{ borderRadius: '0.375rem 0.375rem 0 0' }}>
        <TemplateMiniPreview template={template} fontFamily={fontFamily} />
      </div>

      <div className="p-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">{template.name}</span>
        </div>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `hsl(${template.colors.accent.h}, ${template.colors.accent.s}%, ${template.colors.accent.l}%, 0.15)`,
            color: `hsl(${template.colors.accent.h}, ${template.colors.accent.s}%, ${Math.min(template.colors.accent.l, 50)}%)`,
          }}
        >
          {template.genre}
        </span>
        <p className="text-[11px] text-muted-foreground leading-tight mt-1">{template.description}</p>
        <div className="flex items-center gap-1 pt-1">
          <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: `hsl(${template.colors.primary.h}, ${template.colors.primary.s}%, ${template.colors.primary.l}%)` }} title="Primary" />
          <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: accentColor }} title="Accent" />
          <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: template.colors.bg }} title="Background" />
          <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: template.colors.fg }} title="Foreground" />
        </div>
      </div>
    </button>
  );
};

// ============================================================================
// MAIN WIZARD COMPONENT
// ============================================================================

const StoreSetupWizard = ({ onComplete }: StoreSetupWizardProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<StoreData>({ ...defaultData });
  const [generatedConfig, setGeneratedConfig] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePreset | null>(null);

  const totalSteps = 5;
  const update = (partial: Partial<StoreData>) => setData(prev => ({ ...prev, ...partial }));

  // Dynamic Google Fonts loading
  useEffect(() => {
    if (!open || step !== 0) return;

    const allFonts = templatePresets.map(t => t.googleFonts).join('&family=');
    const link = document.createElement('link');
    link.id = 'wizard-template-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${allFonts}&display=swap`;
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById('wizard-template-fonts');
      if (el) el.remove();
    };
  }, [open, step]);

  const getFontFamily = (template: TemplatePreset) => {
    const fonts = fontPresets[template.fontStyle];
    return fonts ? `${fonts.display}, ${fonts.body}` : 'sans-serif';
  };

  const handleSelectTemplate = (template: TemplatePreset) => {
    setSelectedTemplate(template.id);
    update({
      storeType: template.storeType,
      primaryH: template.colors.primary.h,
      primaryS: template.colors.primary.s,
      primaryL: template.colors.primary.l,
      accentH: template.colors.accent.h,
      accentS: template.colors.accent.s,
      accentL: template.colors.accent.l,
      fontStyle: template.fontStyle,
      borderRadius: template.borderRadius,
      heroType: template.heroType,
      loaderType: template.loaderType,
    });
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate('scratch');
    // Keep defaults, don't change anything
  };

  const generateConfig = () => {
    const fonts = fontPresets[data.fontStyle] || fontPresets.brutalist;
    const paymentPhone = data.esewaPhone || data.phoneRaw;

    const config = `/**
 * AUTO-GENERATED STORE CONFIGURATION
 * Generated for: ${data.storeName}
 * Template: ${selectedTemplate || 'custom'}
 * Date: ${new Date().toISOString().split('T')[0]}
 */

import type { StoreType, CourierProvider, PaymentMethodId, PaymentMethod, NavigationItem, Announcement, LoaderType, HSLColor } from './site.config.types';

export const siteConfig = {
  storeType: "${data.storeType}" as StoreType,

  // BUSINESS IDENTITY
  name: "${data.storeName}",
  tagline: "${data.tagline}",
  description: "${data.tagline}",
  domain: "${data.domain}",
  storeSlug: "${data.storeSlug}",

  // CONTACT
  contact: {
    email: "${data.email}",
    phone: "${data.phone}",
    phoneRaw: "${data.phoneRaw}",
    address: {
      street: "${data.street}",
      city: "${data.city}",
      country: "${data.country}",
      full: "${data.street}, ${data.city}, ${data.country}",
    },
    businessHours: {
      weekdays: "Sunday - Friday: 10:00 AM - 7:00 PM",
      weekends: "Saturday: 11:00 AM - 5:00 PM",
    },
  },

  // SOCIAL
  social: {
    instagram: "${data.instagram}",
    instagramHandle: "${data.instagram ? '@' + data.instagram.split('/').pop() : ''}",
    facebook: "${data.facebook}",
    whatsapp: "https://wa.me/${data.phoneRaw}",
    tiktok: "${data.tiktok}",
  },

  // THEME
  theme: {
    colors: {
      light: {
        background: { h: 0, s: 0, l: 100 },
        foreground: { h: 0, s: 0, l: 0 },
        card: { h: 0, s: 0, l: 100 },
        cardForeground: { h: 0, s: 0, l: 0 },
        primary: { h: ${data.primaryH}, s: ${data.primaryS}, l: ${data.primaryL} },
        primaryForeground: { h: 0, s: 0, l: ${data.primaryL > 50 ? 0 : 100} },
        secondary: { h: ${data.primaryH}, s: ${data.primaryS}, l: ${Math.min(data.primaryL + 5, 95)} },
        secondaryForeground: { h: 0, s: 0, l: 98 },
        muted: { h: 0, s: 0, l: 93 },
        mutedForeground: { h: 0, s: 0, l: 40 },
        accent: { h: ${data.accentH}, s: ${data.accentS}, l: ${data.accentL} },
        accentForeground: { h: 0, s: 0, l: 0 },
        success: { h: 145, s: 65, l: 35 },
        successForeground: { h: 0, s: 0, l: 100 },
        destructive: { h: 0, s: 84, l: 60 },
        destructiveForeground: { h: 0, s: 0, l: 100 },
        border: { h: 0, s: 0, l: 0 },
        input: { h: 0, s: 0, l: 0 },
        ring: { h: ${data.accentH}, s: ${data.accentS}, l: ${data.accentL} },
      },
      dark: {
        background: { h: 0, s: 0, l: 5 },
        foreground: { h: 0, s: 0, l: 98 },
        card: { h: 0, s: 0, l: 8 },
        cardForeground: { h: 0, s: 0, l: 98 },
        primary: { h: 0, s: 0, l: 98 },
        primaryForeground: { h: 0, s: 0, l: 5 },
        secondary: { h: 0, s: 0, l: 15 },
        secondaryForeground: { h: 0, s: 0, l: 98 },
        muted: { h: 0, s: 0, l: 15 },
        mutedForeground: { h: 0, s: 0, l: 65 },
        accent: { h: ${data.accentH}, s: ${data.accentS}, l: ${data.accentL} },
        accentForeground: { h: 0, s: 0, l: 0 },
        success: { h: 145, s: 60, l: 45 },
        successForeground: { h: 0, s: 0, l: 100 },
        destructive: { h: 0, s: 75, l: 55 },
        destructiveForeground: { h: 0, s: 0, l: 100 },
        border: { h: 0, s: 0, l: 30 },
        input: { h: 0, s: 0, l: 30 },
        ring: { h: ${data.accentH}, s: ${data.accentS}, l: ${data.accentL} },
      },
    },
    fonts: {
      display: "${fonts.display}",
      body: "${fonts.body}",
    },
    borderRadius: "${data.borderRadius}",
  },

  // PAYMENT METHODS
  paymentMethods: [
    { id: "cod" as PaymentMethodId, name: "Cash on Delivery", enabled: ${data.codEnabled}, icon: "Banknote" as const },
    { id: "esewa" as PaymentMethodId, name: "eSewa", enabled: ${data.esewaEnabled}, icon: "Smartphone" as const, instructions: "Send payment to ${paymentPhone} and upload screenshot" },
    { id: "khalti" as PaymentMethodId, name: "Khalti", enabled: ${data.khaltiEnabled}, icon: "Smartphone" as const, instructions: "Send payment to ${data.khaltiPhone || paymentPhone} and upload screenshot" },
    { id: "bank" as PaymentMethodId, name: "Bank Transfer", enabled: ${data.bankEnabled}, icon: "Building" as const, instructions: "Account details will be provided at checkout" },
  ] as PaymentMethod[],

  // COURIER & SHIPPING
  courier: {
    provider: "${data.courierProvider}" as CourierProvider,
    ncm: {
      sourceBranch: "${data.sourceBranch}",
      apiUrl: "https://portal.nepalcanmove.com",
      deliveryTypes: ["Branch2Door", "Branch2Branch"] as const,
      defaultWeight: 0.5,
      deliveryTypeLabels: { Branch2Door: "Home Delivery", Branch2Branch: "Office Pickup" },
    },
  },

  shipping: {
    freeShippingThreshold: ${data.freeShippingThreshold},
    freeShippingMessage: "Free Delivery on ${data.freeShippingThreshold} or more items ordered.",
    defaultCost: ${data.defaultShippingCost},
    deliveryEstimate: "2-4 business days",
    codAvailable: ${data.codEnabled},
  },

  // SEO
  seo: {
    title: "${data.storeName} - Official Store",
    description: "${data.tagline}",
    keywords: ["${data.storeType}", "${data.storeName.toLowerCase()}", "nepal", "online store"],
    ogImage: "/og-image.jpg",
    twitterHandle: "",
  },

  // PRODUCTS
  products: {
    currency: "NPR",
    currencySymbol: "Rs.",
    currencyLocale: "en-NP",
    sizeOptions: {
      clothing: ["S", "M", "L", "XL", "XXL"],
      shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      jewelry: ["5", "6", "7", "8", "9", "10", "11", "12"],
      cosmetics: ["30ml", "50ml", "100ml", "200ml"],
      electronics: ["Standard"],
      general: ["One Size"],
    },
    defaultSize: "L",
    get sizes() { return siteConfig.products.sizeOptions[siteConfig.storeType] || ["One Size"]; },
    variants: {
      clothing: [{ key: 'color', label: 'Color', type: 'swatch' as const }],
      jewelry: [{ key: 'metal', label: 'Metal', type: 'button' as const }],
      cosmetics: [{ key: 'shade', label: 'Shade', type: 'swatch' as const }],
      shoes: [{ key: 'color', label: 'Color', type: 'swatch' as const }],
      electronics: [],
      general: [],
    },
  },

  search: {
    popularTerms: ["Popular", "New", "Sale", "Best Seller"],
    placeholder: "Search products...",
  },

  database: {
    orderNumberPrefix: "${data.orderPrefix}",
    storageBucket: "product-images",
  },

  navigation: [
    { name: "Shop", href: "/shop" },
    { name: "New Arrivals", href: "/shop?filter=new" },
    { name: "Sale", href: "/shop?filter=sale" },
    { name: "Contact", href: "/contact" },
  ] as NavigationItem[],

  announcements: [
    { id: "1", text: "Free Delivery on ${data.freeShippingThreshold}+ items ordered.", emoji: "🚚" },
    { id: "2", text: "Cash on Delivery Available All Over Nepal", emoji: "💵" },
  ] as Announcement[],

  hero: {
    type: "${data.heroType}" as "video" | "image" | "carousel",
    slides: [],
    autoPlayInterval: 5000,
    showArrows: true,
    showDots: true,
    pauseOnHover: true,
    subtitle: "${data.tagline}",
    titleLine1: "Welcome to",
    titleLine2: "${data.storeName}",
    description: "${data.tagline}",
    primaryCta: { text: "Shop Now", link: "/shop" },
    secondaryCta: { text: "New Arrivals", link: "/shop?filter=new" },
  },

  newsletter: {
    title: "Stay Updated",
    description: "Subscribe for exclusive deals and new arrivals",
  },

  features: {
    wishlist: true, reviews: true, newsletter: true, whatsappButton: true,
    loyaltyPoints: true, bundleDeals: true, recentlyViewed: true, socialProof: true,
    ncmShipping: ${data.courierProvider === 'ncm'}, pos: true,
    shopByCategory: true, categoryPage: false, categoryImages: true,
  },

  shop: {
    filters: {
      priceRange: true, category: true, size: true,
      league: ${data.storeType === 'clothing'}, era: false, kitType: ${data.storeType === 'clothing'},
      material: ${data.storeType === 'jewelry'}, gemstone: ${data.storeType === 'jewelry'},
      skinType: ${data.storeType === 'cosmetics'},
    },
    filterOptions: { clothing: { leagues: [], eras: [], kitTypes: ["home", "away", "third"] }, jewelry: { materials: [], gemstones: [], styles: [] }, cosmetics: { skinTypes: [], concerns: [], formulas: [] } },
    categoryDisplay: { style: "grid" as "grid", showProductCount: true, showDescription: false, columnsDesktop: 6, columnsMobile: 2 },
    sortOptions: [
      { value: "featured", label: "Featured" },
      { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
    ],
  },

  invoice: {
    storeCode: "${data.orderPrefix}",
    taxEnabled: false, taxRate: 0, taxLabel: "VAT",
    footer: "Thank you for shopping with ${data.storeName}!",
    termsAndConditions: "",
    autoGenerateOnStatus: ["delivered", "confirmed"] as const,
    thermalPrinterWidth: 80,
  },

  pos: {
    enabled: true,
    defaultPaymentMethod: "cash" as "cash" | "qr",
    printOnComplete: true,
    requireCustomerPhone: false,
    storeLocation: {
      fullName: "${data.storeName} Store",
      phone: "${data.phoneRaw}",
      city: "${data.city}",
      district: "${data.street}",
      addressLine1: "${data.street}, ${data.city}",
    },
  },

  loader: {
    type: "${data.loaderType}" as LoaderType,
    tagline: "Loading...",
    showOnce: true,
  },

  mapEmbed: "",

  whatsapp: {
    defaultMessage: "Hi! I'm interested in your products.",
    orderInquiry: "Hi! I'd like to inquire about my order.",
    productInquiry: (productName: string) => \`Hi! I'm interested in the \${productName}.\`,
  },

  footer: {
    about: "${data.tagline}",
    quickLinks: [
      { name: "Shop All", href: "/shop" },
      { name: "New Arrivals", href: "/shop?filter=new" },
      { name: "Sale", href: "/shop?filter=sale" },
    ],
    customerService: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Returns & Refunds", href: "/return-policy" },
      { name: "Track Order", href: "/track-order" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
  },

  requiredSecrets: [
    { name: "NCM_API_TOKEN", description: "Nepal Can Move API token", required: ${data.courierProvider === 'ncm'} },
    { name: "RESEND_API_KEY", description: "Resend.com API key for emails", required: false },
  ],
};

export type SiteConfig = typeof siteConfig;
`;
    setGeneratedConfig(config);
    return config;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      generateConfig();
      const { error } = await supabase.from('store_registry').insert({
        store_name: data.storeName,
        store_url: data.domain,
        plan: 'free',
        owner_id: (await supabase.auth.getUser()).data.user!.id,
      });
      if (error) throw error;
      toast({ title: 'Store registered & config generated!' });
      onComplete();
      setStep(totalSteps + 1); // Show config output
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedConfig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Config copied to clipboard!' });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedConfig], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site.config.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selectedTemplate !== null;
      case 1: return data.storeName && data.domain && data.email;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setStep(0);
    setData({ ...defaultData });
    setGeneratedConfig('');
    setSelectedTemplate(null);
  };

  const stepLabels: Record<number, string> = {
    0: 'Choose Template',
    1: 'Business Details',
    2: 'Store Type & Theme',
    3: 'Payment & Shipping',
    4: 'Review & Generate',
    5: 'Review & Generate',
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) resetAndClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" /> New Store Setup</Button>
      </DialogTrigger>
      <DialogContent className={step === 0 ? "max-w-4xl max-h-[90vh] overflow-y-auto" : "max-w-2xl max-h-[85vh] overflow-y-auto"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 0 && <Sparkles className="h-5 w-5 text-accent" />}
            {step <= totalSteps ? `Step ${step}/${totalSteps}: ` : ''}
            {step <= totalSteps ? stepLabels[step] : 'Configuration Ready'}
          </DialogTitle>
          {step === 0 && (
            <p className="text-sm text-muted-foreground">
              Pick a professionally designed starting point. You can customize everything in the next steps.
            </p>
          )}
        </DialogHeader>

        {/* Step 0: Template Gallery */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {templatePresets.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate === template.id}
                  onSelect={() => handleSelectTemplate(template)}
                  onPreview={() => setPreviewTemplate(template)}
                  fontFamily={getFontFamily(template)}
                />
              ))}
            </div>

            {/* Start from Scratch */}
            <button
              type="button"
              onClick={handleStartFromScratch}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              style={{
                border: selectedTemplate === 'scratch' ? '2px solid hsl(var(--accent))' : '2px dashed hsl(var(--border))',
                borderRadius: '0.5rem',
                background: selectedTemplate === 'scratch' ? 'hsl(var(--accent) / 0.05)' : 'transparent',
              }}
            >
              <Plus className="h-4 w-4" />
              Start from Scratch
            </button>

            {/* Full Preview Dialog */}
            <Dialog open={!!previewTemplate} onOpenChange={(v) => { if (!v) setPreviewTemplate(null); }}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="p-4 pb-0">
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {previewTemplate?.name} — Full Preview
                  </DialogTitle>
                </DialogHeader>
                {previewTemplate && <TemplateFullPreview template={previewTemplate} />}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Step 1: Business */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Store Name *</Label>
                <Input value={data.storeName} onChange={e => update({ storeName: e.target.value, storeSlug: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''), orderPrefix: e.target.value.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3) })} placeholder="My Store Nepal" />
              </div>
              <div>
                <Label>Store Slug</Label>
                <Input value={data.storeSlug} onChange={e => update({ storeSlug: e.target.value })} placeholder="mystorenepal" />
              </div>
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={data.tagline} onChange={e => update({ tagline: e.target.value })} placeholder="Nepal's best online store" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Domain/URL *</Label>
                <Input value={data.domain} onChange={e => update({ domain: e.target.value })} placeholder="https://mystore.com" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input value={data.email} onChange={e => update({ email: e.target.value })} placeholder="info@mystore.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={data.phone} onChange={e => update({ phone: e.target.value })} placeholder="+977 98XXXXXXXX" />
              </div>
              <div>
                <Label>Phone (raw, for WhatsApp)</Label>
                <Input value={data.phoneRaw} onChange={e => update({ phoneRaw: e.target.value })} placeholder="977XXXXXXXXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Street/Area</Label>
                <Input value={data.street} onChange={e => update({ street: e.target.value })} placeholder="Thamel" />
              </div>
              <div>
                <Label>City</Label>
                <Input value={data.city} onChange={e => update({ city: e.target.value })} placeholder="Kathmandu" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Instagram URL</Label>
                <Input value={data.instagram} onChange={e => update({ instagram: e.target.value })} placeholder="https://instagram.com/mystore" />
              </div>
              <div>
                <Label>Facebook URL</Label>
                <Input value={data.facebook} onChange={e => update({ facebook: e.target.value })} placeholder="https://facebook.com/mystore" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Type & Theme */}
        {step === 2 && (
          <div className="space-y-4">
            {selectedTemplate && selectedTemplate !== 'scratch' && (
              <div className="rounded-md border border-accent/30 bg-accent/5 p-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Template applied: {templatePresets.find(t => t.id === selectedTemplate)?.name}
                </span>
                {' '}— customize any value below to override.
              </div>
            )}
            <div>
              <Label>Store Type</Label>
              <Select value={data.storeType} onValueChange={v => update({ storeType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clothing">Clothing / Fashion</SelectItem>
                  <SelectItem value="jewelry">Jewelry</SelectItem>
                  <SelectItem value="cosmetics">Cosmetics / Beauty</SelectItem>
                  <SelectItem value="shoes">Shoes / Footwear</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="general">General Store</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Font Style</Label>
              <Select value={data.fontStyle} onValueChange={v => update({ fontStyle: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="brutalist">Brutalist (Bold, Uppercase)</SelectItem>
                  <SelectItem value="elegant">Elegant (Serif, Classic)</SelectItem>
                  <SelectItem value="modern">Modern (Clean, Minimal)</SelectItem>
                  <SelectItem value="glassmorphism">Glassmorphism (DM Sans)</SelectItem>
                  <SelectItem value="warmearth">Warm Earth (Fraunces + Outfit)</SelectItem>
                  <SelectItem value="neotokyo">Neo Tokyo (Bebas Neue + JetBrains)</SelectItem>
                  <SelectItem value="scandi">Scandi Clean (Manrope + Source Sans)</SelectItem>
                  <SelectItem value="heritage">Heritage Classic (Baskerville + Karla)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Border Radius</Label>
              <Select value={data.borderRadius} onValueChange={v => update({ borderRadius: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sharp (0px)</SelectItem>
                  <SelectItem value="0.125rem">Hairline (2px)</SelectItem>
                  <SelectItem value="0.25rem">Subtle (4px)</SelectItem>
                  <SelectItem value="0.5rem">Rounded (8px)</SelectItem>
                  <SelectItem value="0.75rem">More Rounded (12px)</SelectItem>
                  <SelectItem value="1rem">Pill (16px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Primary Hue (0-360)</Label>
                <Input type="number" min={0} max={360} value={data.primaryH} onChange={e => update({ primaryH: +e.target.value })} />
              </div>
              <div>
                <Label>Primary Sat (%)</Label>
                <Input type="number" min={0} max={100} value={data.primaryS} onChange={e => update({ primaryS: +e.target.value })} />
              </div>
              <div>
                <Label>Primary Light (%)</Label>
                <Input type="number" min={0} max={100} value={data.primaryL} onChange={e => update({ primaryL: +e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label>Preview:</Label>
              <div className="h-8 w-16 rounded border" style={{ backgroundColor: `hsl(${data.primaryH}, ${data.primaryS}%, ${data.primaryL}%)` }} />
              <div className="h-8 w-16 rounded border" style={{ backgroundColor: `hsl(${data.accentH}, ${data.accentS}%, ${data.accentL}%)` }} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Accent Hue</Label>
                <Input type="number" min={0} max={360} value={data.accentH} onChange={e => update({ accentH: +e.target.value })} />
              </div>
              <div>
                <Label>Accent Sat (%)</Label>
                <Input type="number" min={0} max={100} value={data.accentS} onChange={e => update({ accentS: +e.target.value })} />
              </div>
              <div>
                <Label>Accent Light (%)</Label>
                <Input type="number" min={0} max={100} value={data.accentL} onChange={e => update({ accentL: +e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Shipping */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Methods</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cash on Delivery</Label>
                <Switch checked={data.codEnabled} onCheckedChange={v => update({ codEnabled: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>eSewa</Label>
                <Switch checked={data.esewaEnabled} onCheckedChange={v => update({ esewaEnabled: v })} />
              </div>
              {data.esewaEnabled && (
                <Input value={data.esewaPhone} onChange={e => update({ esewaPhone: e.target.value })} placeholder="eSewa phone number" />
              )}
              <div className="flex items-center justify-between">
                <Label>Khalti</Label>
                <Switch checked={data.khaltiEnabled} onCheckedChange={v => update({ khaltiEnabled: v })} />
              </div>
              {data.khaltiEnabled && (
                <Input value={data.khaltiPhone} onChange={e => update({ khaltiPhone: e.target.value })} placeholder="Khalti phone number" />
              )}
              <div className="flex items-center justify-between">
                <Label>Bank Transfer</Label>
                <Switch checked={data.bankEnabled} onCheckedChange={v => update({ bankEnabled: v })} />
              </div>
            </div>
            <h3 className="font-semibold pt-2">Shipping</h3>
            <div>
              <Label>Courier Provider</Label>
              <Select value={data.courierProvider} onValueChange={v => update({ courierProvider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ncm">Nepal Can Move (NCM)</SelectItem>
                  <SelectItem value="custom">Custom / Manual</SelectItem>
                  <SelectItem value="none">No Shipping (Pickup Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {data.courierProvider === 'ncm' && (
              <div>
                <Label>NCM Source Branch</Label>
                <Input value={data.sourceBranch} onChange={e => update({ sourceBranch: e.target.value.toUpperCase() })} placeholder="e.g. NARAYANGHAT" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Shipping Cost (NPR)</Label>
                <Input type="number" value={data.defaultShippingCost} onChange={e => update({ defaultShippingCost: +e.target.value })} />
              </div>
              <div>
                <Label>Free Shipping After (items)</Label>
                <Input type="number" value={data.freeShippingThreshold} onChange={e => update({ freeShippingThreshold: +e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-2 text-sm">
                {selectedTemplate && selectedTemplate !== 'scratch' && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="font-medium">{templatePresets.find(t => t.id === selectedTemplate)?.name}</span></div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Store</span><span className="font-medium">{data.storeName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span className="font-medium">{data.domain}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium capitalize">{data.storeType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Font</span><span className="font-medium capitalize">{data.fontStyle}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Courier</span><span className="font-medium uppercase">{data.courierProvider}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Order Prefix</span><span className="font-medium">{data.orderPrefix}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payments</span>
                  <span className="font-medium">
                    {[data.codEnabled && 'COD', data.esewaEnabled && 'eSewa', data.khaltiEnabled && 'Khalti', data.bankEnabled && 'Bank'].filter(Boolean).join(', ')}
                  </span>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Prefix</Label>
                <Input value={data.orderPrefix} onChange={e => update({ orderPrefix: e.target.value.toUpperCase() })} placeholder="e.g. MSN" />
              </div>
              <div>
                <Label>Hero Type</Label>
                <Select value={data.heroType} onValueChange={v => update({ heroType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Hero</SelectItem>
                    <SelectItem value="image">Static Image</SelectItem>
                    <SelectItem value="carousel">Image Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5+: Config Output */}
        {step > totalSteps && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Config'}
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download .ts
              </Button>
            </div>
            <Textarea
              value={generatedConfig}
              readOnly
              className="font-mono text-xs min-h-[300px]"
            />
            <Button onClick={resetAndClose} className="w-full">Done</Button>
          </div>
        )}

        {/* Navigation */}
        {step <= totalSteps && (
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? 'Generating...' : 'Generate Config'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StoreSetupWizard;
