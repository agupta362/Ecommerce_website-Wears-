import React from 'react';
import { Search, ShoppingCart, Heart, Star, Minus, Plus, ChevronRight, MapPin, Phone, Mail, Send, Filter, Trash2 } from 'lucide-react';

interface TemplateColors {
  primary: { h: number; s: number; l: number };
  accent: { h: number; s: number; l: number };
  bg: string;
  fg: string;
  cardBg: string;
  mutedBg: string;
  mutedFg: string;
  borderColor: string;
}

interface TemplatePreviewProps {
  templateId: string;
  colors: TemplateColors;
  displayFont: string;
  bodyFont: string;
  borderRadius: string;
}

const getAccent = (c: TemplateColors) => `hsl(${c.accent.h}, ${c.accent.s}%, ${c.accent.l}%)`;
const getPrimary = (c: TemplateColors) => `hsl(${c.primary.h}, ${c.primary.s}%, ${c.primary.l}%)`;

// ============================================================================
// SHOP PAGE PREVIEW
// ============================================================================

export const ShopPagePreview = ({ templateId, colors, displayFont, bodyFont, borderRadius }: TemplatePreviewProps) => {
  const accent = getAccent(colors);
  const primary = getPrimary(colors);
  const r = borderRadius === '0' ? '0px' : borderRadius;
  const wrap: React.CSSProperties = { backgroundColor: colors.bg, color: colors.fg, fontFamily: bodyFont, minHeight: '600px', position: 'relative', overflow: 'hidden' };

  const products = [
    { name: 'Premium Collection', price: 2499 },
    { name: 'Signature Edition', price: 1899 },
    { name: 'Classic Essential', price: 1299 },
    { name: 'Limited Drop', price: 3499 },
    { name: 'Everyday Staple', price: 999 },
    { name: 'New Season', price: 2199 },
  ];

  const sizes = ['S', 'M', 'L', 'XL'];

  switch (templateId) {
    case 'brutalist-sports':
      return (
        <div style={wrap} className="w-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: `3px solid ${colors.fg}` }}>
            <span style={{ fontFamily: displayFont, fontWeight: 900, fontSize: '20px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>STORE / SHOP</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '4px 12px', border: `2px solid ${colors.fg}`, fontSize: '11px', fontFamily: displayFont, fontWeight: 700, textTransform: 'uppercase' }}>FILTER</span>
              <span style={{ padding: '4px 12px', border: `2px solid ${colors.fg}`, fontSize: '11px', fontFamily: displayFont, fontWeight: 700, textTransform: 'uppercase' }}>SORT ▼</span>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {/* Sidebar */}
            <div style={{ width: '200px', borderRight: `3px solid ${colors.fg}`, padding: '16px', flexShrink: 0 }}>
              <div style={{ fontFamily: displayFont, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>CATEGORIES</div>
              {['All', 'New Arrivals', 'Sale', 'Bestsellers'].map(c => (
                <div key={c} style={{ padding: '6px 0', fontSize: '12px', fontWeight: c === 'All' ? 700 : 400, borderBottom: `1px solid ${colors.mutedBg}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c}</div>
              ))}
              <div style={{ fontFamily: displayFont, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '20px', marginBottom: '12px' }}>SIZE</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {sizes.map(s => (
                  <span key={s} style={{ padding: '4px 10px', border: `2px solid ${s === 'M' ? colors.fg : colors.mutedBg}`, fontSize: '10px', fontWeight: 700, backgroundColor: s === 'M' ? colors.fg : 'transparent', color: s === 'M' ? colors.bg : colors.fg }}>{s}</span>
                ))}
              </div>
              <div style={{ fontFamily: displayFont, fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '20px', marginBottom: '8px' }}>PRICE</div>
              <div style={{ height: '3px', backgroundColor: colors.mutedBg, position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20%', right: '30%', top: 0, height: '100%', backgroundColor: accent }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '4px', color: colors.mutedFg }}>
                <span>Rs. 500</span><span>Rs. 5,000</span>
              </div>
            </div>
            {/* Grid */}
            <div style={{ flex: 1, padding: '16px' }}>
              <div style={{ fontSize: '11px', color: colors.mutedFg, marginBottom: '12px' }}>Showing 6 products</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '4px' }}>
                {products.map((p, i) => (
                  <div key={i} style={{ gridRow: i === 0 ? '1 / 3' : undefined, border: `3px solid ${colors.fg}` }}>
                    <div style={{ aspectRatio: i === 0 ? '3/4' : '1', backgroundColor: colors.mutedBg, position: 'relative' }}>
                      {i < 2 && <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: i === 0 ? accent : colors.fg, color: colors.bg, padding: '2px 8px', fontSize: '9px', fontFamily: displayFont, fontWeight: 800, textTransform: 'uppercase' }}>{i === 0 ? 'NEW' : 'SALE'}</div>}
                    </div>
                    <div style={{ padding: '8px 10px', borderTop: `3px solid ${colors.fg}` }}>
                      <div style={{ fontFamily: displayFont, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: accent, marginTop: '2px' }}>Rs. {p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'elegant-atelier':
      return (
        <div style={{ ...wrap, textAlign: 'center' }} className="w-full">
          <div style={{ padding: '24px', borderBottom: `0.5px solid ${colors.borderColor}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '22px', letterSpacing: '0.15em' }}>Shop All</span>
            <div style={{ width: '40px', height: '0.5px', backgroundColor: accent, margin: '8px auto' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', color: colors.mutedFg, letterSpacing: '0.1em' }}>
              <span style={{ borderBottom: `1px solid ${accent}`, color: accent }}>All</span>
              <span>Rings</span><span>Necklaces</span><span>Earrings</span><span>Bracelets</span>
            </div>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
            {products.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px 0', borderBottom: `0.5px solid ${colors.borderColor}`, textAlign: 'left' }}>
                <div style={{ width: '100px', height: '120px', backgroundColor: colors.mutedBg, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 700, letterSpacing: '0.03em' }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: colors.mutedFg, marginTop: '2px', fontStyle: 'italic' }}>Handcrafted · 18K Gold</div>
                  <div style={{ fontSize: '14px', color: accent, marginTop: '6px' }}>Rs. {p.price.toLocaleString()}</div>
                </div>
                <Heart size={16} style={{ color: colors.mutedFg, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'noir-minimal':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: displayFont, fontSize: '48px', fontWeight: 300, letterSpacing: '-0.03em' }}>Shop</span>
            <span style={{ fontSize: '11px', color: colors.mutedFg, letterSpacing: '0.1em', textTransform: 'uppercase' }}>6 items</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {products.map((p, i) => (
              <div key={i} style={{ aspectRatio: '3/4', backgroundColor: i % 2 === 0 ? colors.mutedBg : colors.cardBg, position: 'relative' }}>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', color: '#fff' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.7 }}>Rs. {p.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div style={{ ...wrap, background: 'linear-gradient(135deg, #0f0a1f, #1a1040, #0f0a1f)' }} className="w-full">
          <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: `radial-gradient(circle, hsl(270,85%,65%,0.2), transparent 70%)`, filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '32px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, color: colors.fg }}>Shop</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '6px 16px', borderRadius: '50px', backgroundColor: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>All</span>
                <span style={{ padding: '6px 16px', borderRadius: '50px', backgroundColor: accent, fontSize: '11px', color: '#fff', fontWeight: 600 }}>New</span>
                <span style={{ padding: '6px 16px', borderRadius: '50px', backgroundColor: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Sale</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {products.map((p, i) => (
                <div key={i} style={{ borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.1)', overflow: 'hidden', transform: `translateY(${i % 2 === 0 ? 0 : 12}px)` }}>
                  <div style={{ aspectRatio: '4/5', background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.08))' }} />
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: colors.fg }}>{p.name}</div>
                    <div style={{ fontSize: '14px', color: accent, fontWeight: 700, marginTop: '4px' }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'warm-earth':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '24px 24px 12px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700 }}>Shop All</span>
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
              {['All', 'Skincare', 'Haircare', 'Body', 'Lips'].map(c => (
                <span key={c} style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: c === 'All' ? colors.fg : colors.mutedBg, color: c === 'All' ? colors.bg : colors.fg, fontSize: '11px', fontWeight: 500 }}>{c}</span>
              ))}
            </div>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: 'auto auto', gap: '12px' }}>
              <div style={{ gridRow: '1 / 3', borderRadius: r, overflow: 'hidden', backgroundColor: colors.mutedBg, position: 'relative', minHeight: '300px' }}>
                <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                  <div style={{ fontFamily: displayFont, fontSize: '18px', fontWeight: 700 }}>{products[0].name}</div>
                  <div style={{ fontSize: '14px', color: primary, fontWeight: 600 }}>Rs. {products[0].price.toLocaleString()}</div>
                </div>
              </div>
              {products.slice(1, 5).map((p, i) => (
                <div key={i} style={{ borderRadius: r, backgroundColor: colors.mutedBg, padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: r, backgroundColor: accent, opacity: 0.2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: primary }}>Rs. {p.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'neo-tokyo':
      return (
        <div style={{ ...wrap, background: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace" }} className="w-full">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '20px 24px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: displayFont, fontSize: '20px', color: accent, letterSpacing: '0.15em' }}>CATALOG</span>
              <span style={{ fontSize: '10px', color: colors.mutedFg }}>{'>'} {products.length} ITEMS_FOUND</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              {['ALL', 'NEW', 'LIMITED', 'SALE'].map(c => (
                <span key={c} style={{ padding: '3px 10px', border: `1px solid ${c === 'ALL' ? accent : colors.borderColor}`, color: c === 'ALL' ? accent : colors.mutedFg, fontSize: '9px', letterSpacing: '0.15em' }}>{c}</span>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', padding: '16px 24px' }}>
            {products.map((p, i) => (
              <div key={i} style={{ backgroundColor: colors.cardBg, border: `1px solid ${i === 0 ? accent : colors.borderColor}` }}>
                <div style={{ aspectRatio: '1', background: `linear-gradient(180deg, ${colors.mutedBg}, ${colors.cardBg})`, position: 'relative' }}>
                  {i === 0 && <div style={{ position: 'absolute', top: '4px', left: '4px', backgroundColor: accent, color: '#0a0a0f', padding: '2px 6px', fontSize: '7px', fontWeight: 700 }}>NEW</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: accent, boxShadow: `0 0 6px ${accent}60` }} />
                </div>
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '9px', color: colors.fg }}>{p.name}</div>
                  <div style={{ fontSize: '11px', color: accent, fontWeight: 700, marginTop: '2px', textShadow: `0 0 6px ${accent}40` }}>Rs.{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'scandi-clean':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '40px 40px 20px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 300 }}>Shop</span>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: colors.mutedFg }}>
              <span style={{ color: colors.fg, fontWeight: 500 }}>All</span>
              <span>Living</span><span>Kitchen</span><span>Bedroom</span>
            </div>
          </div>
          <div style={{ padding: '24px 40px' }}>
            {products.map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', gap: '24px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ width: '180px', height: '130px', borderRadius: r, backgroundColor: colors.mutedBg, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                <div>
                  <div style={{ fontFamily: displayFont, fontSize: '15px', fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: colors.mutedFg, marginTop: '2px' }}>Thoughtfully designed</div>
                  <div style={{ fontSize: '14px', color: accent, fontWeight: 600, marginTop: '6px' }}>Rs. {p.price.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'heritage-classic':
      return (
        <div style={{ ...wrap, borderTop: `4px double ${colors.fg}` }} className="w-full">
          <div style={{ textAlign: 'center', padding: '24px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '24px', letterSpacing: '0.06em' }}>The Shop</span>
            <div style={{ width: '40px', height: '1px', backgroundColor: accent, margin: '8px auto' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic' }}>
              <span style={{ color: accent }}>All</span><span>·</span><span>Men</span><span>·</span><span>Women</span><span>·</span><span>Jackets</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '32px' }}>
            {products.map((p, i) => (
              <div key={i} style={{ borderRight: i % 3 < 2 ? `0.5px solid ${colors.borderColor}` : 'none', paddingRight: i % 3 < 2 ? '24px' : 0 }}>
                <div style={{ aspectRatio: '4/5', backgroundColor: colors.mutedBg, borderRadius: r, marginBottom: '12px' }} />
                <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic', marginBottom: '4px' }}>Handcrafted excellence</div>
                <div style={{ fontSize: '13px', color: accent, fontWeight: 600 }}>Rs. {p.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'daily-gazette':
      return (
        <div style={{ ...wrap, fontFamily: bodyFont }} className="w-full">
          {/* Masthead */}
          <div style={{ borderTop: '3px solid ' + colors.fg, borderBottom: '1px solid ' + colors.fg, height: '6px', margin: '0 24px' }} />
          <div style={{ textAlign: 'center', padding: '8px 0 6px' }}>
            <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, letterSpacing: '0.04em' }}>THE DAILY GAZETTE — SHOP</div>
          </div>
          <div style={{ borderTop: '1px solid ' + colors.fg, borderBottom: '2px solid ' + colors.fg, height: '5px', margin: '0 24px' }} />
          {/* Category tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '10px 0', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: colors.mutedFg, borderBottom: '0.5px solid ' + colors.borderColor }}>
            <span style={{ color: accent, fontWeight: 700 }}>All</span>
            <span>New Arrivals</span><span>Classics</span><span>Sale</span><span>Jackets</span>
          </div>
          {/* Section header */}
          <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.mutedFg }}>★ ALL LISTINGS ★</span>
          </div>
          {/* Classified-style grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', padding: '0 24px' }}>
            {products.map((p, i) => (
              <div key={i} style={{ borderRight: (i % 3) < 2 ? '1px solid ' + colors.borderColor : 'none', borderBottom: '1px solid ' + colors.borderColor, padding: '12px 16px' }}>
                <div style={{ backgroundColor: colors.mutedBg, aspectRatio: '4/5', marginBottom: '8px' }} />
                <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{p.name}</div>
                <div style={{ fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic', marginBottom: '4px' }}>Premium quality · All sizes · COD available</div>
                <div style={{ fontSize: '14px', color: accent, fontWeight: 700 }}>Rs. {p.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div style={wrap} className="w-full" />;
  }
};

// ============================================================================
// PRODUCT PAGE PREVIEW
// ============================================================================

export const ProductPagePreview = ({ templateId, colors, displayFont, bodyFont, borderRadius }: TemplatePreviewProps) => {
  const accent = getAccent(colors);
  const primary = getPrimary(colors);
  const r = borderRadius === '0' ? '0px' : borderRadius;
  const wrap: React.CSSProperties = { backgroundColor: colors.bg, color: colors.fg, fontFamily: bodyFont, minHeight: '600px', position: 'relative', overflow: 'hidden' };

  switch (templateId) {
    case 'brutalist-sports':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '8px 24px', fontSize: '10px', borderBottom: `2px solid ${colors.fg}`, display: 'flex', gap: '8px', textTransform: 'uppercase', fontFamily: displayFont, letterSpacing: '0.08em' }}>
            <span style={{ color: colors.mutedFg }}>Home</span><span>/</span><span style={{ color: colors.mutedFg }}>Shop</span><span>/</span><span style={{ fontWeight: 700 }}>Premium Collection</span>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, backgroundColor: colors.mutedBg, aspectRatio: '1', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: accent, color: colors.bg, padding: '4px 12px', fontFamily: displayFont, fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>NEW DROP</div>
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '4px' }}>
                {[1,2,3,4].map(i => <div key={i} style={{ width: '40px', height: '40px', border: `2px solid ${i === 1 ? colors.fg : colors.mutedFg}`, backgroundColor: colors.bg, opacity: i === 1 ? 1 : 0.6 }} />)}
              </div>
            </div>
            <div style={{ flex: 1, padding: '32px', borderLeft: `3px solid ${colors.fg}` }}>
              <div style={{ fontFamily: displayFont, fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>PREMIUM<br/>COLLECTION<br/>PIECE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
                <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 900, color: accent }}>Rs. 2,499</span>
                <span style={{ fontSize: '14px', color: colors.mutedFg, textDecoration: 'line-through' }}>Rs. 3,299</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ color: accent, fill: i <= 4 ? accent : 'transparent' }} />)}
                <span style={{ fontSize: '11px', color: colors.mutedFg, marginLeft: '4px' }}>(42 reviews)</span>
              </div>
              <div style={{ fontFamily: displayFont, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>SELECT SIZE</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '8px 16px', border: `2px solid ${s === 'L' ? colors.fg : colors.mutedBg}`, fontWeight: 700, fontSize: '12px', backgroundColor: s === 'L' ? colors.fg : 'transparent', color: s === 'L' ? colors.bg : colors.fg }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ flex: 1, padding: '14px', backgroundColor: accent, color: colors.bg, fontFamily: displayFont, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', border: `3px solid ${colors.fg}` }}>ADD TO CART</span>
                <span style={{ padding: '14px 16px', border: `3px solid ${colors.fg}` }}><Heart size={18} /></span>
              </div>
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `2px solid ${colors.fg}` }}>
                <div style={{ fontFamily: displayFont, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>DESCRIPTION</div>
                <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 1.6 }}>Premium quality material, designed for comfort and style. Built to last through every season.</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'elegant-atelier':
      return (
        <div style={{ ...wrap, textAlign: 'center' }} className="w-full">
          <div style={{ padding: '12px', fontSize: '10px', color: colors.mutedFg, letterSpacing: '0.1em' }}>Home · Shop · Premium Collection</div>
          <div style={{ display: 'flex', maxWidth: '800px', margin: '0 auto', padding: '40px', gap: '48px', textAlign: 'left' }}>
            <div style={{ flex: 1 }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: colors.mutedBg, marginBottom: '12px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1,2,3].map(i => <div key={i} style={{ width: '60px', height: '60px', backgroundColor: colors.mutedBg, border: i === 1 ? `0.5px solid ${accent}` : 'none' }} />)}
              </div>
            </div>
            <div style={{ flex: 1, paddingTop: '20px' }}>
              <div style={{ fontSize: '10px', color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Limited Collection</div>
              <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, letterSpacing: '0.03em', lineHeight: 1.2, marginBottom: '8px' }}>Premium Collection Piece</div>
              <div style={{ width: '30px', height: '0.5px', backgroundColor: accent, margin: '12px 0' }} />
              <div style={{ fontSize: '22px', color: accent, marginBottom: '16px' }}>Rs. 2,499</div>
              <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>Handcrafted with the finest materials, each piece is a testament to enduring beauty.</div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Size</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['5','6','7','8'].map(s => (
                  <span key={s} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `0.5px solid ${s === '7' ? colors.fg : colors.borderColor}`, fontSize: '12px', borderRadius: '50%' }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '12px', border: `0.5px solid ${colors.fg}`, textAlign: 'center', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Add to Bag</span>
              <span style={{ display: 'block', padding: '12px', backgroundColor: colors.fg, color: colors.bg, textAlign: 'center', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Buy Now</span>
            </div>
          </div>
        </div>
      );

    case 'noir-minimal':
      return (
        <div style={wrap} className="w-full">
          <div style={{ display: 'flex', minHeight: '500px' }}>
            <div style={{ flex: 1.2, backgroundColor: colors.mutedBg }} />
            <div style={{ flex: 1, padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px' }}>Premium<br/>Collection</div>
              <div style={{ fontSize: '20px', fontWeight: 300, marginBottom: '24px' }}>Rs. 2,499</div>
              <div style={{ fontSize: '13px', color: colors.mutedFg, lineHeight: 1.7, marginBottom: '32px' }}>Minimal design, maximum impact. Crafted for those who appreciate understated elegance.</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '8px 14px', border: `1px solid ${s === 'M' ? colors.fg : colors.borderColor}`, fontSize: '11px', fontWeight: s === 'M' ? 600 : 300 }}>{s}</span>
                ))}
              </div>
              <span style={{ padding: '14px 32px', backgroundColor: colors.fg, color: colors.bg, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>Add to Bag</span>
            </div>
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div style={{ ...wrap, background: 'linear-gradient(135deg, #0f0a1f, #1a1040, #0f0a1f)' }} className="w-full">
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: `radial-gradient(circle, ${accent}30, transparent 70%)`, filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', padding: '40px', gap: '40px' }}>
            <div style={{ flex: 1, borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.1)', aspectRatio: '4/5' }} />
            <div style={{ flex: 1, paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>New Arrival</div>
              <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, color: colors.fg, marginBottom: '8px' }}>Premium Collection Piece</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ color: accent, fill: i <= 4 ? accent : 'transparent' }} />)}
              </div>
              <div style={{ fontSize: '28px', color: accent, fontWeight: 700, marginBottom: '24px' }}>Rs. 2,499</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '24px' }}>Where innovation meets elegance. Premium materials, futuristic design.</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '8px 16px', borderRadius: '50px', backgroundColor: s === 'L' ? accent : 'rgba(255,255,255,0.06)', color: s === 'L' ? '#fff' : 'rgba(255,255,255,0.6)', border: '0.5px solid rgba(255,255,255,0.1)', fontSize: '11px' }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '14px', borderRadius: '50px', background: `linear-gradient(135deg, ${accent}, hsl(${colors.accent.h + 30}, ${colors.accent.s}%, ${colors.accent.l}%))`, color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>Add to Cart</span>
            </div>
          </div>
        </div>
      );

    case 'warm-earth':
      return (
        <div style={wrap} className="w-full">
          <div style={{ display: 'flex', padding: '32px', gap: '40px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ aspectRatio: '4/5', borderRadius: r, backgroundColor: colors.mutedBg }} />
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: accent, opacity: 0.15 }} />
            </div>
            <div style={{ flex: 1, paddingTop: '16px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, lineHeight: 1.2, marginBottom: '8px' }}>Premium Collection Piece</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ color: primary, fill: i <= 4 ? primary : 'transparent' }} />)}
              </div>
              <div style={{ fontSize: '24px', color: primary, fontWeight: 700, marginBottom: '16px' }}>Rs. 2,499</div>
              <div style={{ fontSize: '13px', color: colors.mutedFg, lineHeight: 1.7, marginBottom: '20px' }}>Pure, organic ingredients blended for your skin's natural glow.</div>
              <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '8px' }}>Size</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
                {['30ml','50ml','100ml'].map(s => (
                  <span key={s} style={{ padding: '8px 16px', borderRadius: '20px', backgroundColor: s === '50ml' ? colors.fg : colors.mutedBg, color: s === '50ml' ? colors.bg : colors.fg, fontSize: '11px', fontWeight: 500 }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '14px', borderRadius: '50px', backgroundColor: primary, color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>Add to Cart</span>
            </div>
          </div>
        </div>
      );

    case 'neo-tokyo':
      return (
        <div style={{ ...wrap, background: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace" }} className="w-full">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '8px 24px', fontSize: '9px', color: colors.mutedFg, borderBottom: `1px solid ${colors.borderColor}` }}>{'>'} HOME / CATALOG / ITEM_2499</div>
          <div style={{ position: 'relative', zIndex: 2, display: 'flex' }}>
            <div style={{ flex: 1, backgroundColor: colors.mutedBg, aspectRatio: '1', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: accent, color: '#0a0a0f', padding: '3px 8px', fontSize: '8px', fontWeight: 700 }}>NEW_DROP</div>
            </div>
            <div style={{ flex: 1, padding: '24px', borderLeft: `1px solid ${colors.borderColor}` }}>
              <div style={{ fontSize: '9px', color: accent, marginBottom: '4px' }}>{'>'} PRODUCT.LOAD()</div>
              <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 900, color: accent, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1, textShadow: `0 0 15px ${accent}40`, marginBottom: '16px' }}>PREMIUM<br/>COLLECTION</div>
              <div style={{ fontSize: '11px', color: colors.mutedFg, marginBottom: '8px' }}>
                <span>STATUS: </span><span style={{ color: accent }}>IN_STOCK</span>
              </div>
              <div style={{ fontSize: '24px', color: accent, fontWeight: 700, marginBottom: '16px', textShadow: `0 0 10px ${accent}40` }}>Rs. 2,499</div>
              <div style={{ fontSize: '10px', color: colors.mutedFg, marginBottom: '6px' }}>SELECT_SIZE:</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '6px 14px', border: `1px solid ${s === 'L' ? accent : colors.borderColor}`, color: s === 'L' ? accent : colors.mutedFg, fontSize: '10px', boxShadow: s === 'L' ? `0 0 8px ${accent}30` : 'none' }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '12px', border: `1px solid ${accent}`, color: accent, textAlign: 'center', fontSize: '11px', letterSpacing: '0.15em', boxShadow: `0 0 15px ${accent}20` }}>ADD_TO_CART →</span>
            </div>
          </div>
        </div>
      );

    case 'scandi-clean':
      return (
        <div style={wrap} className="w-full">
          <div style={{ display: 'flex', padding: '48px 40px', gap: '48px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ aspectRatio: '4/5', borderRadius: r, backgroundColor: colors.mutedBg, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} />
            </div>
            <div style={{ flex: 1, paddingTop: '24px' }}>
              <div style={{ fontFamily: displayFont, fontSize: '32px', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '8px' }}>Premium Collection</div>
              <div style={{ fontSize: '20px', fontWeight: 300, color: accent, marginBottom: '20px' }}>Rs. 2,499</div>
              <div style={{ fontSize: '13px', color: colors.mutedFg, lineHeight: 1.7, marginBottom: '24px' }}>Minimalist design for mindful living. Crafted from sustainable materials.</div>
              <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px' }}>Size</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '8px 16px', borderRadius: r, border: `1px solid ${s === 'M' ? colors.fg : colors.borderColor}`, fontSize: '12px', fontWeight: s === 'M' ? 500 : 300 }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '14px', borderRadius: r, backgroundColor: colors.fg, color: colors.bg, textAlign: 'center', fontSize: '12px', fontWeight: 500 }}>Add to Cart</span>
            </div>
          </div>
        </div>
      );

    case 'heritage-classic':
      return (
        <div style={{ ...wrap, borderTop: `4px double ${colors.fg}` }} className="w-full">
          <div style={{ padding: '12px 32px', fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic', borderBottom: `1px solid ${colors.borderColor}` }}>Home · Shop · Premium Collection Piece</div>
          <div style={{ display: 'flex', padding: '32px', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: colors.mutedBg, borderRadius: r }} />
            </div>
            <div style={{ flex: 1, paddingTop: '16px' }}>
              <div style={{ fontSize: '10px', color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Limited Edition</div>
              <div style={{ fontFamily: displayFont, fontSize: '26px', fontWeight: 700, letterSpacing: '0.03em', lineHeight: 1.2, marginBottom: '12px' }}>Premium Collection Piece</div>
              <div style={{ width: '30px', height: '1px', backgroundColor: accent, marginBottom: '12px' }} />
              <div style={{ fontSize: '20px', color: accent, fontWeight: 600, marginBottom: '16px' }}>Rs. 2,499</div>
              <div style={{ fontFamily: bodyFont, fontSize: '13px', color: colors.mutedFg, lineHeight: 1.7, fontStyle: 'italic', marginBottom: '24px' }}>A masterpiece of craftsmanship, inspired by timeless tradition.</div>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Select Size</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '8px 16px', border: `1px solid ${s === 'L' ? colors.fg : colors.borderColor}`, fontSize: '11px', borderRadius: r }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '12px', border: `1px solid ${colors.fg}`, textAlign: 'center', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add to Bag</span>
            </div>
          </div>
        </div>
      );

    case 'daily-gazette':
      return (
        <div style={{ ...wrap, fontFamily: bodyFont }} className="w-full">
          <div style={{ borderTop: '3px solid ' + colors.fg, borderBottom: '1px solid ' + colors.fg, height: '6px', margin: '0 24px' }} />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>THE DAILY GAZETTE</div>
          </div>
          <div style={{ borderTop: '1px solid ' + colors.fg, borderBottom: '2px solid ' + colors.fg, height: '5px', margin: '0 24px' }} />
          {/* Breadcrumb */}
          <div style={{ padding: '8px 24px', fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic', borderBottom: '0.5px solid ' + colors.borderColor }}>
            Front Page › Shop › Premium Collection Piece
          </div>
          {/* Article-style product */}
          <div style={{ display: 'flex', padding: '24px', gap: '32px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: colors.mutedBg, marginBottom: '8px' }} />
              <div style={{ fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic' }}>The Premium Collection Piece, photographed in our studio. Credit: Staff</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {[1,2,3].map(i => <div key={i} style={{ width: '50px', height: '50px', backgroundColor: colors.mutedBg, border: i === 1 ? '1px solid ' + colors.fg : '0.5px solid ' + colors.borderColor }} />)}
              </div>
            </div>
            <div style={{ flex: 1, paddingTop: '8px' }}>
              <div style={{ fontSize: '10px', color: accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Product Review</div>
              <div style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, lineHeight: 1.1, marginBottom: '8px' }}>Premium Collection Piece</div>
              <div style={{ fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic', marginBottom: '12px' }}>By Our Style Desk · Published today</div>
              <div style={{ borderTop: '0.5px solid ' + colors.borderColor, borderBottom: '0.5px solid ' + colors.borderColor, padding: '8px 0', margin: '0 0 16px' }}>
                <span style={{ fontFamily: displayFont, fontSize: '24px', fontWeight: 700, color: accent }}>Rs. 2,499</span>
                <span style={{ fontSize: '13px', color: colors.mutedFg, textDecoration: 'line-through', marginLeft: '12px' }}>Rs. 3,299</span>
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                <span style={{ fontSize: '28px', fontFamily: displayFont, fontWeight: 700, float: 'left', lineHeight: 0.85, marginRight: '4px', marginTop: '3px' }}>A</span>
                truly exceptional piece that combines timeless design with modern craftsmanship. Built to last through every season, this collection piece has been our reviewer's favourite this quarter.
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Select Size</div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {['S','M','L','XL'].map(s => (
                  <span key={s} style={{ padding: '8px 16px', border: s === 'L' ? '2px solid ' + colors.fg : '1px solid ' + colors.borderColor, fontSize: '11px', fontWeight: s === 'L' ? 700 : 400 }}>{s}</span>
                ))}
              </div>
              <span style={{ display: 'block', padding: '12px', backgroundColor: colors.fg, color: colors.bg, textAlign: 'center', fontFamily: displayFont, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add to Cart</span>
            </div>
          </div>
        </div>
      );

    default:
      return <div style={wrap} className="w-full" />;
  }
};

// ============================================================================
// CART PAGE PREVIEW
// ============================================================================

export const CartPagePreview = ({ templateId, colors, displayFont, bodyFont, borderRadius }: TemplatePreviewProps) => {
  const accent = getAccent(colors);
  const primary = getPrimary(colors);
  const r = borderRadius === '0' ? '0px' : borderRadius;
  const wrap: React.CSSProperties = { backgroundColor: colors.bg, color: colors.fg, fontFamily: bodyFont, minHeight: '600px', position: 'relative', overflow: 'hidden' };

  const cartItems = [
    { name: 'Premium Collection Piece', size: 'L', price: 2499, qty: 1 },
    { name: 'Classic Essential', size: 'M', price: 1299, qty: 2 },
  ];
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  switch (templateId) {
    case 'brutalist-sports':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '16px 24px', borderBottom: `3px solid ${colors.fg}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>YOUR CART</span>
            <span style={{ fontSize: '12px', color: colors.mutedFg, marginLeft: '12px' }}>({cartItems.length} items)</span>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1.5, padding: '16px 24px' }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: `2px solid ${colors.fg}`, alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: colors.mutedBg, border: `2px solid ${colors.fg}`, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: colors.mutedFg, marginTop: '2px' }}>Size: {item.size}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: `2px solid ${colors.fg}` }}>
                    <span style={{ padding: '4px 8px', cursor: 'pointer' }}>−</span>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.qty}</span>
                    <span style={{ padding: '4px 8px', cursor: 'pointer' }}>+</span>
                  </div>
                  <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 900, minWidth: '90px', textAlign: 'right' }}>Rs. {(item.price * item.qty).toLocaleString()}</div>
                  <Trash2 size={16} style={{ color: colors.mutedFg, cursor: 'pointer', flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <div style={{ width: '280px', borderLeft: `3px solid ${colors.fg}`, padding: '16px 24px', backgroundColor: colors.mutedBg }}>
              <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>ORDER SUMMARY</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span>Subtotal</span><span style={{ fontWeight: 700 }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span>Shipping</span><span style={{ fontWeight: 700 }}>Rs. 150</span>
              </div>
              <div style={{ borderTop: `3px solid ${colors.fg}`, paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase' }}>Total</span>
                <span style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 900, color: accent }}>Rs. {(subtotal + 150).toLocaleString()}</span>
              </div>
              <span style={{ display: 'block', marginTop: '20px', padding: '14px', backgroundColor: accent, color: colors.bg, fontFamily: displayFont, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', border: `3px solid ${colors.fg}` }}>CHECKOUT →</span>
            </div>
          </div>
        </div>
      );

    case 'elegant-atelier':
      return (
        <div style={{ ...wrap, textAlign: 'center' }} className="w-full">
          <div style={{ padding: '32px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '24px', letterSpacing: '0.1em' }}>Shopping Bag</span>
            <div style={{ width: '40px', height: '0.5px', backgroundColor: accent, margin: '8px auto' }} />
          </div>
          <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', textAlign: 'left' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', padding: '24px 0', borderBottom: `0.5px solid ${colors.borderColor}`, alignItems: 'center' }}>
                <div style={{ width: '100px', height: '120px', backgroundColor: colors.mutedBg, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic', marginTop: '4px' }}>Size: {item.size}</div>
                  <div style={{ fontSize: '14px', color: accent, marginTop: '6px' }}>Rs. {item.price.toLocaleString()}</div>
                </div>
                <div style={{ fontSize: '13px' }}>Qty: {item.qty}</div>
              </div>
            ))}
            <div style={{ padding: '24px 0', textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: colors.mutedFg, marginBottom: '4px' }}>Subtotal</div>
              <div style={{ fontFamily: displayFont, fontSize: '22px', color: accent }}>Rs. {subtotal.toLocaleString()}</div>
              <span style={{ display: 'inline-block', marginTop: '16px', padding: '12px 48px', border: `0.5px solid ${colors.fg}`, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Proceed to Checkout</span>
            </div>
          </div>
        </div>
      );

    case 'noir-minimal':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '48px 32px 24px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '48px', fontWeight: 300, letterSpacing: '-0.03em' }}>Cart</span>
          </div>
          <div style={{ padding: '0 32px' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', padding: '24px 0', borderBottom: `1px solid ${colors.borderColor}`, alignItems: 'center' }}>
                <div style={{ width: '80px', height: '100px', backgroundColor: colors.mutedBg, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 400 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: colors.mutedFg, marginTop: '4px' }}>{item.size} · Qty {item.qty}</div>
                </div>
                <div style={{ fontSize: '15px' }}>Rs. {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ textAlign: 'right', padding: '32px 0' }}>
              <div style={{ fontSize: '11px', color: colors.mutedFg, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Total</div>
              <div style={{ fontSize: '24px', fontWeight: 300 }}>Rs. {subtotal.toLocaleString()}</div>
              <span style={{ display: 'inline-block', marginTop: '24px', padding: '14px 48px', backgroundColor: colors.fg, color: colors.bg, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Checkout</span>
            </div>
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div style={{ ...wrap, background: 'linear-gradient(135deg, #0f0a1f, #1a1040, #0f0a1f)' }} className="w-full">
          <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: `radial-gradient(circle, ${accent}20, transparent 70%)`, filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '32px 40px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700, color: colors.fg }}>Your Cart</span>
            <div style={{ marginTop: '24px' }}>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.1)', marginBottom: '12px', alignItems: 'center' }}>
                  <div style={{ width: '60px', height: '70px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: colors.fg }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Size: {item.size}</div>
                  </div>
                  <div style={{ fontSize: '15px', color: accent, fontWeight: 700 }}>Rs. {(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px', padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Subtotal</span>
                <span style={{ color: colors.fg, fontWeight: 600 }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <span style={{ display: 'block', marginTop: '16px', padding: '14px', borderRadius: '50px', background: `linear-gradient(135deg, ${accent}, hsl(${colors.accent.h + 30}, ${colors.accent.s}%, ${colors.accent.l}%))`, color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>Checkout</span>
            </div>
          </div>
        </div>
      );

    case 'warm-earth':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '24px 32px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '28px', fontWeight: 700 }}>Your Bag</span>
          </div>
          <div style={{ padding: '24px 32px' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', borderRadius: r, backgroundColor: colors.mutedBg, marginBottom: '12px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: r, backgroundColor: accent, opacity: 0.2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: colors.mutedFg }}>Size: {item.size}</div>
                </div>
                <div style={{ fontSize: '15px', color: primary, fontWeight: 700 }}>Rs. {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ marginTop: '24px', padding: '20px', borderRadius: r, border: `1px solid ${colors.borderColor}`, textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: primary }}>Rs. {subtotal.toLocaleString()}</div>
              <span style={{ display: 'inline-block', marginTop: '16px', padding: '12px 36px', borderRadius: '50px', backgroundColor: primary, color: '#fff', fontWeight: 600, fontSize: '13px' }}>Checkout</span>
            </div>
          </div>
        </div>
      );

    case 'neo-tokyo':
      return (
        <div style={{ ...wrap, background: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace" }} className="w-full">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '20px 24px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '24px', color: accent, letterSpacing: '0.15em' }}>CART</span>
            <span style={{ fontSize: '10px', color: colors.mutedFg, marginLeft: '12px' }}>// {cartItems.length} ITEMS</span>
          </div>
          <div style={{ position: 'relative', zIndex: 2, padding: '16px 24px' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px', border: `1px solid ${colors.borderColor}`, marginBottom: '4px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: colors.mutedBg, border: `1px solid ${colors.borderColor}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: colors.fg }}>{item.name}</div>
                  <div style={{ fontSize: '9px', color: colors.mutedFg }}>SIZE: {item.size} | QTY: {item.qty}</div>
                </div>
                <div style={{ fontSize: '13px', color: accent, fontWeight: 700, textShadow: `0 0 6px ${accent}40` }}>Rs.{(item.price * item.qty)}</div>
              </div>
            ))}
            <div style={{ marginTop: '16px', padding: '12px', border: `1px solid ${accent}`, boxShadow: `0 0 10px ${accent}15` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: colors.mutedFg }}>TOTAL:</span>
                <span style={{ color: accent, fontWeight: 700, fontSize: '16px' }}>Rs.{subtotal}</span>
              </div>
              <span style={{ display: 'block', marginTop: '12px', padding: '12px', border: `1px solid ${accent}`, color: accent, textAlign: 'center', fontSize: '11px', letterSpacing: '0.15em', boxShadow: `0 0 15px ${accent}20` }}>CHECKOUT →</span>
            </div>
          </div>
        </div>
      );

    case 'scandi-clean':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '40px 40px 20px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '32px', fontWeight: 300 }}>Your cart</span>
          </div>
          <div style={{ padding: '0 40px' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: `1px solid ${colors.borderColor}`, alignItems: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: r, backgroundColor: colors.mutedBg, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: colors.mutedFg, marginTop: '2px' }}>Size: {item.size}</div>
                </div>
                <div style={{ fontSize: '14px', color: accent, fontWeight: 600 }}>Rs. {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ padding: '24px 0', textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: 300 }}>Rs. {subtotal.toLocaleString()}</div>
              <span style={{ display: 'inline-block', marginTop: '20px', padding: '14px 40px', borderRadius: r, backgroundColor: colors.fg, color: colors.bg, fontSize: '12px', fontWeight: 500 }}>Checkout</span>
            </div>
          </div>
        </div>
      );

    case 'heritage-classic':
      return (
        <div style={{ ...wrap, borderTop: `4px double ${colors.fg}` }} className="w-full">
          <div style={{ textAlign: 'center', padding: '32px', borderBottom: `1px solid ${colors.borderColor}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '24px', letterSpacing: '0.06em' }}>Shopping Bag</span>
            <div style={{ width: '40px', height: '1px', backgroundColor: accent, margin: '8px auto' }} />
          </div>
          <div style={{ padding: '24px 32px' }}>
            {cartItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: `0.5px solid ${colors.borderColor}`, alignItems: 'center' }}>
                <div style={{ width: '80px', height: '100px', backgroundColor: colors.mutedBg, borderRadius: r, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: displayFont, fontSize: '15px', fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic' }}>Size: {item.size}</div>
                </div>
                <div style={{ fontSize: '14px', color: accent, fontWeight: 600 }}>Rs. {(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ textAlign: 'right', padding: '24px 0' }}>
              <div style={{ fontFamily: displayFont, fontSize: '18px' }}>Total: Rs. {subtotal.toLocaleString()}</div>
              <span style={{ display: 'inline-block', marginTop: '16px', padding: '12px 40px', border: `1px solid ${colors.fg}`, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Proceed to Checkout</span>
            </div>
          </div>
        </div>
      );

    case 'daily-gazette':
      return (
        <div style={{ ...wrap, fontFamily: bodyFont }} className="w-full">
          <div style={{ borderTop: '3px solid ' + colors.fg, borderBottom: '1px solid ' + colors.fg, height: '6px', margin: '0 24px' }} />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>THE DAILY GAZETTE</div>
          </div>
          <div style={{ borderTop: '1px solid ' + colors.fg, borderBottom: '2px solid ' + colors.fg, height: '5px', margin: '0 24px' }} />
          {/* Order slip header */}
          <div style={{ textAlign: 'center', padding: '20px 24px 12px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '22px', letterSpacing: '0.06em' }}>Order Slip</span>
            <div style={{ fontSize: '11px', color: colors.mutedFg, fontStyle: 'italic', marginTop: '4px' }}>Review your selections before placing your order</div>
          </div>
          <div style={{ padding: '0 32px 24px', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ borderTop: '2px solid ' + colors.fg, borderBottom: '2px solid ' + colors.fg, marginBottom: '16px' }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', padding: '8px 0', borderBottom: '1px solid ' + colors.borderColor, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <span>Item Description</span><span>Size</span><span style={{ textAlign: 'center' }}>Qty</span><span style={{ textAlign: 'right' }}>Amount</span>
              </div>
              {cartItems.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', padding: '12px 0', borderBottom: '0.5px solid ' + colors.borderColor, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700 }}>{item.name}</div>
                    <div style={{ fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic' }}>Premium quality · COD available</div>
                  </div>
                  <span style={{ fontSize: '12px' }}>{item.size}</span>
                  <span style={{ fontSize: '12px', textAlign: 'center' }}>{item.qty}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, textAlign: 'right' }}>Rs. {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span>Delivery</span><span>Rs. 150</span>
                </div>
                <div style={{ borderTop: '2px solid ' + colors.fg, paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase' }}>Total Due</span>
                  <span style={{ fontFamily: displayFont, fontSize: '18px', fontWeight: 700, color: accent }}>Rs. {(subtotal + 150).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <span style={{ display: 'block', marginTop: '24px', padding: '12px', backgroundColor: colors.fg, color: colors.bg, textAlign: 'center', fontFamily: displayFont, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Place Order</span>
          </div>
        </div>
      );

    default:
      return <div style={wrap} className="w-full" />;
  }
};

// ============================================================================
// CONTACT PAGE PREVIEW
// ============================================================================

export const ContactPagePreview = ({ templateId, colors, displayFont, bodyFont, borderRadius }: TemplatePreviewProps) => {
  const accent = getAccent(colors);
  const primary = getPrimary(colors);
  const r = borderRadius === '0' ? '0px' : borderRadius;
  const wrap: React.CSSProperties = { backgroundColor: colors.bg, color: colors.fg, fontFamily: bodyFont, minHeight: '600px', position: 'relative', overflow: 'hidden' };

  switch (templateId) {
    case 'brutalist-sports':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '32px 24px', borderBottom: `3px solid ${colors.fg}` }}>
            <span style={{ fontFamily: displayFont, fontSize: '48px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>GET IN<br/>TOUCH.</span>
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '32px 24px', borderRight: `3px solid ${colors.fg}` }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: displayFont, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>NAME</div>
                <div style={{ padding: '10px 12px', border: `2px solid ${colors.fg}`, fontSize: '12px', color: colors.mutedFg }}>Your name</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: displayFont, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>EMAIL</div>
                <div style={{ padding: '10px 12px', border: `2px solid ${colors.fg}`, fontSize: '12px', color: colors.mutedFg }}>your@email.com</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontFamily: displayFont, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>MESSAGE</div>
                <div style={{ padding: '10px 12px', border: `2px solid ${colors.fg}`, fontSize: '12px', color: colors.mutedFg, height: '100px' }}>Your message...</div>
              </div>
              <span style={{ padding: '14px 32px', backgroundColor: accent, color: colors.bg, fontFamily: displayFont, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', border: `3px solid ${colors.fg}`, display: 'inline-block' }}>SEND →</span>
            </div>
            <div style={{ width: '280px', padding: '32px 24px', backgroundColor: colors.fg, color: colors.bg }}>
              <div style={{ fontFamily: displayFont, fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>INFO</div>
              <div style={{ fontSize: '12px', lineHeight: 2 }}>
                <div>📍 Thamel, Kathmandu</div>
                <div>📞 +977 98XXXXXXXX</div>
                <div>✉️ info@store.com</div>
                <div>🕐 Sun-Fri: 10AM-7PM</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'elegant-atelier':
      return (
        <div style={{ ...wrap, textAlign: 'center' }} className="w-full">
          <div style={{ padding: '48px 24px 32px' }}>
            <div style={{ fontFamily: displayFont, fontSize: '28px', letterSpacing: '0.1em' }}>Contact Us</div>
            <div style={{ width: '40px', height: '0.5px', backgroundColor: accent, margin: '12px auto' }} />
            <div style={{ fontSize: '13px', color: colors.mutedFg, fontStyle: 'italic', maxWidth: '400px', margin: '0 auto' }}>We'd love to hear from you. Our team is always here to assist.</div>
          </div>
          <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 24px 32px', textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Your Name</div>
              <div style={{ padding: '10px', borderBottom: `0.5px solid ${colors.borderColor}`, fontSize: '12px', color: colors.mutedFg }}>Enter your name</div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Email</div>
              <div style={{ padding: '10px', borderBottom: `0.5px solid ${colors.borderColor}`, fontSize: '12px', color: colors.mutedFg }}>your@email.com</div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Message</div>
              <div style={{ padding: '10px', borderBottom: `0.5px solid ${colors.borderColor}`, fontSize: '12px', color: colors.mutedFg, height: '80px' }}>Your message</div>
            </div>
            <span style={{ display: 'block', padding: '12px', border: `0.5px solid ${colors.fg}`, textAlign: 'center', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Send Message</span>
          </div>
          <div style={{ borderTop: `0.5px solid ${colors.borderColor}`, padding: '24px', display: 'flex', justifyContent: 'center', gap: '48px', fontSize: '12px', color: colors.mutedFg }}>
            <div style={{ textAlign: 'center' }}><MapPin size={16} style={{ margin: '0 auto 4px', color: accent }} />Thamel, Kathmandu</div>
            <div style={{ textAlign: 'center' }}><Phone size={16} style={{ margin: '0 auto 4px', color: accent }} />+977 98XXXXXXXX</div>
            <div style={{ textAlign: 'center' }}><Mail size={16} style={{ margin: '0 auto 4px', color: accent }} />info@store.com</div>
          </div>
        </div>
      );

    case 'noir-minimal':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '80px 32px 40px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '64px', fontWeight: 300, letterSpacing: '-0.03em' }}>Say hello.</span>
          </div>
          <div style={{ padding: '0 32px', maxWidth: '500px' }}>
            <div style={{ padding: '16px 0', borderBottom: `1px solid ${colors.borderColor}` }}>
              <div style={{ fontSize: '12px', color: colors.mutedFg }}>Name</div>
            </div>
            <div style={{ padding: '16px 0', borderBottom: `1px solid ${colors.borderColor}` }}>
              <div style={{ fontSize: '12px', color: colors.mutedFg }}>Email</div>
            </div>
            <div style={{ padding: '16px 0', borderBottom: `1px solid ${colors.borderColor}`, height: '80px' }}>
              <div style={{ fontSize: '12px', color: colors.mutedFg }}>Message</div>
            </div>
            <span style={{ display: 'inline-block', marginTop: '24px', padding: '14px 48px', backgroundColor: colors.fg, color: colors.bg, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Send</span>
          </div>
        </div>
      );

    case 'glassmorphism':
      return (
        <div style={{ ...wrap, background: 'linear-gradient(135deg, #0f0a1f, #1a1040, #0f0a1f)' }} className="w-full">
          <div style={{ position: 'absolute', top: '30%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: `radial-gradient(circle, ${accent}20, transparent 70%)`, filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '48px 40px' }}>
            <div style={{ fontFamily: displayFont, fontSize: '32px', fontWeight: 700, color: colors.fg, marginBottom: '8px' }}>Get in Touch</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' }}>We'd love to hear from you</div>
            <div style={{ padding: '24px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
              {['Name', 'Email', 'Message'].map((f, i) => (
                <div key={f} style={{ padding: '12px 0', borderBottom: i < 2 ? '0.5px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{f}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', height: f === 'Message' ? '60px' : 'auto' }}>Enter {f.toLowerCase()}</div>
                </div>
              ))}
              <span style={{ display: 'block', marginTop: '16px', padding: '12px', borderRadius: '50px', background: `linear-gradient(135deg, ${accent}, hsl(${colors.accent.h + 30}, ${colors.accent.s}%, ${colors.accent.l}%))`, color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '12px' }}>Send Message</span>
            </div>
          </div>
        </div>
      );

    case 'warm-earth':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '32px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', right: '40px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: accent, opacity: 0.1 }} />
            <span style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 700 }}>Let's Talk</span>
            <div style={{ fontSize: '13px', color: colors.mutedFg, marginTop: '8px' }}>We're here for you</div>
          </div>
          <div style={{ padding: '0 32px 32px', maxWidth: '500px' }}>
            {['Name', 'Email', 'Message'].map(f => (
              <div key={f} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>{f}</div>
                <div style={{ padding: '10px 14px', borderRadius: r, border: `1px solid ${colors.borderColor}`, fontSize: '12px', color: colors.mutedFg, height: f === 'Message' ? '80px' : 'auto' }}>Enter {f.toLowerCase()}</div>
              </div>
            ))}
            <span style={{ display: 'inline-block', padding: '12px 32px', borderRadius: '50px', backgroundColor: primary, color: '#fff', fontWeight: 600, fontSize: '13px' }}>Send Message</span>
          </div>
        </div>
      );

    case 'neo-tokyo':
      return (
        <div style={{ ...wrap, background: '#0a0a0f', fontFamily: "'JetBrains Mono', monospace" }} className="w-full">
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2, padding: '32px 24px' }}>
            <div style={{ fontSize: '10px', color: colors.mutedFg, marginBottom: '8px' }}>{'>'} CONTACT.INIT()</div>
            <div style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 900, color: accent, letterSpacing: '0.15em', textShadow: `0 0 20px ${accent}40` }}>CONTACT</div>
          </div>
          <div style={{ position: 'relative', zIndex: 2, padding: '0 24px 32px', maxWidth: '500px' }}>
            {['NAME', 'EMAIL', 'MESSAGE'].map(f => (
              <div key={f} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '9px', color: accent, letterSpacing: '0.15em', marginBottom: '4px' }}>{f}:</div>
                <div style={{ padding: '8px 12px', border: `1px solid ${colors.borderColor}`, fontSize: '11px', color: colors.mutedFg, height: f === 'MESSAGE' ? '80px' : 'auto' }}>{'>'} _</div>
              </div>
            ))}
            <span style={{ display: 'inline-block', padding: '10px 24px', border: `1px solid ${accent}`, color: accent, fontSize: '11px', letterSpacing: '0.15em', boxShadow: `0 0 15px ${accent}20` }}>TRANSMIT →</span>
          </div>
        </div>
      );

    case 'scandi-clean':
      return (
        <div style={wrap} className="w-full">
          <div style={{ padding: '48px 40px 20px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '36px', fontWeight: 300 }}>Contact us</span>
            <div style={{ fontSize: '13px', color: colors.mutedFg, marginTop: '8px' }}>We'd love to hear from you</div>
          </div>
          <div style={{ padding: '24px 40px', maxWidth: '500px' }}>
            {['Name', 'Email', 'Message'].map(f => (
              <div key={f} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>{f}</div>
                <div style={{ padding: '10px 14px', borderRadius: r, border: `1px solid ${colors.borderColor}`, fontSize: '12px', color: colors.mutedFg, height: f === 'Message' ? '80px' : 'auto' }}>Enter {f.toLowerCase()}</div>
              </div>
            ))}
            <span style={{ display: 'inline-block', padding: '12px 32px', borderRadius: r, backgroundColor: colors.fg, color: colors.bg, fontSize: '12px', fontWeight: 500 }}>Send</span>
          </div>
        </div>
      );

    case 'heritage-classic':
      return (
        <div style={{ ...wrap, borderTop: `4px double ${colors.fg}` }} className="w-full">
          <div style={{ textAlign: 'center', padding: '40px 24px 24px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '28px', letterSpacing: '0.06em' }}>Contact Us</span>
            <div style={{ width: '40px', height: '1px', backgroundColor: accent, margin: '8px auto' }} />
            <div style={{ fontSize: '13px', color: colors.mutedFg, fontStyle: 'italic' }}>We're delighted to hear from you</div>
          </div>
          <div style={{ display: 'flex', padding: '24px 32px', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              {['Your Name', 'Email Address', 'Your Message'].map(f => (
                <div key={f} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{f}</div>
                  <div style={{ padding: '10px', border: `0.5px solid ${colors.borderColor}`, borderRadius: r, fontSize: '12px', color: colors.mutedFg, height: f.includes('Message') ? '100px' : 'auto' }}>Enter here</div>
                </div>
              ))}
              <span style={{ display: 'inline-block', padding: '10px 32px', border: `1px solid ${colors.fg}`, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Send Message</span>
            </div>
            <div style={{ width: '220px', padding: '20px', backgroundColor: colors.mutedBg, borderRadius: r }}>
              <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Visit Us</div>
              <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 2, fontStyle: 'italic' }}>
                <div>Thamel, Kathmandu</div>
                <div>+977 98XXXXXXXX</div>
                <div>info@store.com</div>
                <div>Sun-Fri: 10AM-7PM</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'daily-gazette':
      return (
        <div style={{ ...wrap, fontFamily: bodyFont }} className="w-full">
          <div style={{ borderTop: '3px solid ' + colors.fg, borderBottom: '1px solid ' + colors.fg, height: '6px', margin: '0 24px' }} />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontFamily: displayFont, fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em' }}>THE DAILY GAZETTE</div>
          </div>
          <div style={{ borderTop: '1px solid ' + colors.fg, borderBottom: '2px solid ' + colors.fg, height: '5px', margin: '0 24px' }} />
          <div style={{ textAlign: 'center', padding: '24px 24px 16px' }}>
            <span style={{ fontFamily: displayFont, fontSize: '24px', letterSpacing: '0.06em' }}>Letters to the Editor</span>
            <div style={{ fontSize: '12px', color: colors.mutedFg, fontStyle: 'italic', marginTop: '6px' }}>We welcome your correspondence. Please use the form below.</div>
          </div>
          <div style={{ display: 'flex', padding: '0 32px 32px', gap: '32px' }}>
            <div style={{ flex: 1 }}>
              {['Your Name', 'Email Address', 'Subject', 'Your Letter'].map(f => (
                <div key={f} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{f}</div>
                  <div style={{ padding: '10px', border: '1px solid ' + colors.borderColor, fontSize: '12px', color: colors.mutedFg, height: f.includes('Letter') ? '120px' : 'auto', backgroundColor: colors.cardBg }}>Enter {f.toLowerCase()}</div>
                </div>
              ))}
              <span style={{ display: 'inline-block', padding: '10px 28px', backgroundColor: colors.fg, color: colors.bg, fontFamily: displayFont, fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Submit Letter</span>
            </div>
            <div style={{ width: '220px', padding: '16px', backgroundColor: colors.mutedBg, borderTop: '2px solid ' + colors.fg }}>
              <div style={{ fontFamily: displayFont, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Editorial Office</div>
              <div style={{ fontSize: '12px', color: colors.mutedFg, lineHeight: 2, fontStyle: 'italic' }}>
                <div>📍 Thamel, Kathmandu</div>
                <div>📞 +977 98XXXXXXXX</div>
                <div>✉️ letters@gazette.com</div>
                <div>🕐 Sun-Fri: 10AM-7PM</div>
              </div>
              <div style={{ borderTop: '0.5px solid ' + colors.borderColor, marginTop: '12px', paddingTop: '12px', fontSize: '10px', color: colors.mutedFg, fontStyle: 'italic' }}>Letters may be edited for length and clarity.</div>
            </div>
          </div>
        </div>
      );

    default:
      return <div style={wrap} className="w-full" />;
  }
};
