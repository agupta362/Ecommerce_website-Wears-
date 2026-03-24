import { useState, useEffect } from 'react';
import { Check, Eye, EyeOff, Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { templatePresets, fontPresets, templateToThemeConfig } from '@/components/admin/templatePresets';
import type { TemplatePreset } from '@/components/admin/templatePresets';
import { ShopPagePreview, ProductPagePreview } from '@/components/admin/TemplatePagePreviews';
import { useActiveTheme, useUpdateActiveTheme } from '@/hooks/useActiveTheme';
import { useThemePreview } from '@/context/ThemePreviewContext';

const AdminTheme = () => {
  const { data: activeTheme, isLoading } = useActiveTheme();
  const updateTheme = useUpdateActiveTheme();
  const { previewTheme, setPreviewTheme } = useThemePreview();
  const [selected, setSelected] = useState<string | null>(null);
  const [livePreviewOn, setLivePreviewOn] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePreset | null>(null);
  const [previewPage, setPreviewPage] = useState<'shop' | 'product'>('shop');

  // Sync selected with current active theme
  useEffect(() => {
    if (activeTheme?.templateId) {
      setSelected(activeTheme.templateId);
    }
  }, [activeTheme]);

  // Load Google Fonts for previews
  useEffect(() => {
    const allFonts = templatePresets.map(t => t.googleFonts).join('&family=');
    const link = document.createElement('link');
    link.id = 'admin-theme-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${allFonts}&display=swap`;
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById('admin-theme-fonts');
      if (el) el.remove();
    };
  }, []);

  // Clear preview on unmount
  useEffect(() => {
    return () => setPreviewTheme(null);
  }, [setPreviewTheme]);

  // Update live preview when selected template changes while preview is on
  useEffect(() => {
    if (livePreviewOn && selected) {
      const template = templatePresets.find(t => t.id === selected);
      if (template) setPreviewTheme(templateToThemeConfig(template));
    }
  }, [selected, livePreviewOn, setPreviewTheme]);

  const toggleLivePreview = () => {
    if (livePreviewOn) {
      setLivePreviewOn(false);
      setPreviewTheme(null);
    } else if (selected) {
      const template = templatePresets.find(t => t.id === selected);
      if (template) {
        setLivePreviewOn(true);
        setPreviewTheme(templateToThemeConfig(template));
      }
    }
  };

  const handleApply = async () => {
    if (!selected) return;
    const template = templatePresets.find(t => t.id === selected);
    if (!template) return;

    const config = templateToThemeConfig(template);
    try {
      await updateTheme.mutateAsync(config);
      setLivePreviewOn(false);
      setPreviewTheme(null);
      toast({ title: 'Theme applied!', description: `${template.name} is now live on your store.` });
    } catch (err: any) {
      toast({ title: 'Error applying theme', description: err.message, variant: 'destructive' });
    }
  };

  const isCurrentlyActive = (id: string) => activeTheme?.templateId === id;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedTemplateName = selected ? templatePresets.find(t => t.id === selected)?.name : null;

  return (
    <div className="space-y-6">
      {/* Live preview banner */}
      {livePreviewOn && selectedTemplateName && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span>Previewing <strong>{selectedTemplateName}</strong> — changes not saved yet</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setLivePreviewOn(false); setPreviewTheme(null); }}>
            Exit Preview
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display uppercase tracking-wider flex items-center gap-2">
            <Palette className="h-6 w-6" /> Store Theme
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a design template. Use Live Preview to see it on your store before applying.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={livePreviewOn ? 'secondary' : 'outline'}
            onClick={toggleLivePreview}
            disabled={!selected}
          >
            {livePreviewOn ? (
              <><EyeOff className="h-4 w-4 mr-2" /> Exit Preview</>
            ) : (
              <><Eye className="h-4 w-4 mr-2" /> Live Preview</>
            )}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!selected || isCurrentlyActive(selected) || updateTheme.isPending}
          >
            {updateTheme.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Applying...</>
            ) : (
              'Apply Template'
            )}
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatePresets.map(template => {
          const fonts = fontPresets[template.fontStyle] || fontPresets.brutalist;
          const fontFamily = `${fonts.display}, ${fonts.body}`;
          const accent = `hsl(${template.colors.accent.h}, ${template.colors.accent.s}%, ${template.colors.accent.l}%)`;
          const isSelected = selected === template.id;
          const isActive = isCurrentlyActive(template.id);

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelected(template.id)}
            >
              {/* Mini preview area */}
              <div className="relative bg-muted aspect-[16/10] overflow-hidden">
                <MiniPreviewThumb template={template} fontFamily={fontFamily} />
                {isActive && (
                  <Badge className="absolute top-2 left-2 z-10" variant="default">
                    Active
                  </Badge>
                )}
                {isSelected && !isActive && (
                  <div
                    className="absolute top-2 right-2 z-10 rounded-full flex items-center justify-center"
                    style={{ width: 24, height: 24, backgroundColor: accent, color: template.colors.bg }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
                <button
                  className="absolute bottom-2 right-2 z-10 p-1.5 rounded-md bg-background/80 border text-foreground opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                  style={{ opacity: undefined }}
                  onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template); }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{template.name}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `hsl(${template.colors.accent.h}, ${template.colors.accent.s}%, ${template.colors.accent.l}%, 0.15)`,
                      color: `hsl(${template.colors.accent.h}, ${template.colors.accent.s}%, ${Math.min(template.colors.accent.l, 50)}%)`,
                    }}
                  >
                    {template.genre}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{template.description}</p>
                <div className="flex items-center gap-1">
                  <div className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: `hsl(${template.colors.primary.h}, ${template.colors.primary.s}%, ${template.colors.primary.l}%)` }} />
                  <div className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: accent }} />
                  <div className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: template.colors.bg }} />
                  <div className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: template.colors.fg }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(v) => { if (!v) setPreviewTemplate(null); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {previewTemplate?.name} — Full Preview
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div>
              <div className="flex gap-2 px-4 pb-3">
                <Button
                  variant={previewPage === 'shop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewPage('shop')}
                >
                  Shop Page
                </Button>
                <Button
                  variant={previewPage === 'product' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewPage('product')}
                >
                  Product Page
                </Button>
              </div>
              <div className="overflow-hidden">
                {previewPage === 'shop' ? (
                  <ShopPagePreview
                    templateId={previewTemplate.id}
                    colors={previewTemplate.colors}
                    displayFont={(fontPresets[previewTemplate.fontStyle] || fontPresets.brutalist).display}
                    bodyFont={(fontPresets[previewTemplate.fontStyle] || fontPresets.brutalist).body}
                    borderRadius={previewTemplate.borderRadius}
                  />
                ) : (
                  <ProductPagePreview
                    templateId={previewTemplate.id}
                    colors={previewTemplate.colors}
                    displayFont={(fontPresets[previewTemplate.fontStyle] || fontPresets.brutalist).display}
                    bodyFont={(fontPresets[previewTemplate.fontStyle] || fontPresets.brutalist).body}
                    borderRadius={previewTemplate.borderRadius}
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Simplified thumbnail for the grid — reuses template colors for a quick visual
const MiniPreviewThumb = ({ template, fontFamily }: { template: TemplatePreset; fontFamily: string }) => {
  const { colors } = template;
  const accent = `hsl(${colors.accent.h}, ${colors.accent.s}%, ${colors.accent.l}%)`;

  return (
    <div
      className="w-full h-full select-none pointer-events-none flex flex-col"
      style={{ backgroundColor: colors.bg, color: colors.fg, fontFamily, fontSize: '7px' }}
    >
      {/* Nav bar */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
        <span style={{ fontWeight: 700, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Store</span>
        <div className="flex gap-2" style={{ fontSize: '6px', color: colors.mutedFg }}>
          <span>Shop</span><span>New</span><span style={{ color: accent }}>Sale</span>
        </div>
      </div>
      {/* Hero block */}
      <div className="flex-1 flex items-center px-3 py-2">
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1, letterSpacing: '0.05em' }}>
            Style
          </div>
          <div className="mt-1 inline-block px-2 py-0.5" style={{ backgroundColor: accent, color: colors.bg, fontSize: '5px', fontWeight: 700 }}>
            SHOP NOW
          </div>
        </div>
      </div>
      {/* Product grid */}
      <div className="grid grid-cols-3 gap-0.5 px-2 pb-2">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ aspectRatio: '1', backgroundColor: colors.mutedBg, border: `0.5px solid ${colors.borderColor}` }} />
        ))}
      </div>
    </div>
  );
};

export default AdminTheme;
