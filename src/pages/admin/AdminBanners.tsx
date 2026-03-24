import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  SaleBanner,
} from '@/hooks/useBanners';
import { supabase } from '@/integrations/supabase/client';

const backgroundStyles = [
  { value: 'retro-gradient', label: 'Retro Gradient (Primary)' },
  { value: 'bg-destructive', label: 'Red/Sale' },
  { value: 'bg-accent', label: 'Accent Gold' },
  { value: 'bg-secondary', label: 'Dark' },
  { value: 'custom-image', label: 'Custom Image' },
];

const AdminBanners = () => {
  const { data: banners, isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SaleBanner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: 'Shop Now',
    button_link: '/shop',
    background_style: 'retro-gradient',
    image_url: '',
    is_active: false,
    display_order: 0,
    start_date: '',
    end_date: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      button_text: 'Shop Now',
      button_link: '/shop',
      background_style: 'retro-gradient',
      image_url: '',
      is_active: false,
      display_order: 0,
      start_date: '',
      end_date: '',
    });
    setEditingBanner(null);
  };

  const openEditDialog = (banner: SaleBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      button_text: banner.button_text,
      button_link: banner.button_link,
      background_style: banner.background_style,
      image_url: banner.image_url || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banners/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bannerData = {
      title: formData.title,
      subtitle: formData.subtitle || null,
      button_text: formData.button_text,
      button_link: formData.button_link,
      background_style: formData.background_style,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
      display_order: formData.display_order,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
    };

    try {
      if (editingBanner) {
        await updateBanner.mutateAsync({ id: editingBanner.id, ...bannerData });
        toast.success('Banner updated!');
      } else {
        await createBanner.mutateAsync(bannerData);
        toast.success('Banner created!');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save banner:', error);
      toast.error('Failed to save banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await deleteBanner.mutateAsync(id);
      toast.success('Banner deleted!');
    } catch (error) {
      console.error('Failed to delete banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner: SaleBanner) => {
    try {
      await updateBanner.mutateAsync({ id: banner.id, is_active: !banner.is_active });
      toast.success(banner.is_active ? 'Banner deactivated' : 'Banner activated');
    } catch (error) {
      console.error('Failed to toggle banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const handleReorder = async (banner: SaleBanner, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? banner.display_order - 1 : banner.display_order + 1;
    try {
      await updateBanner.mutateAsync({ id: banner.id, display_order: newOrder });
    } catch (error) {
      console.error('Failed to reorder banner:', error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-wider">Sale Banners</h1>
          <p className="text-muted-foreground">Manage promotional banners on the homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Update the banner details below.' : 'Fill in the details to create a new promotional banner.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Champions Sale"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Up to 25% off on selected jerseys"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData(prev => ({ ...prev, button_link: e.target.value }))}
                    placeholder="/shop?filter=sale"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="background_style">Background Style</Label>
                <Select
                  value={formData.background_style}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, background_style: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundStyles.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload */}
              <div>
                <Label>Background Image (Optional)</Label>
                <div className="mt-2 space-y-2">
                  {formData.image_url ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img 
                        src={formData.image_url} 
                        alt="Banner preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {isUploading ? 'Uploading...' : 'Click to upload image'}
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date (Optional)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBanner.isPending || updateBanner.isPending || isUploading}>
                  {editingBanner ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {banners?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No banners yet</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              Create your first banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {banners?.map((banner) => (
            <Card key={banner.id} className={!banner.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {banner.image_url && (
                      <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={banner.image_url} 
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {banner.title}
                        {banner.is_active ? (
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded">Active</span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Inactive</span>
                        )}
                      </CardTitle>
                      {banner.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{banner.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(banner, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReorder(banner, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(banner)}
                    >
                      {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Style: {backgroundStyles.find(s => s.value === banner.background_style)?.label}</span>
                  <span>Link: {banner.button_link}</span>
                  <span>Order: {banner.display_order}</span>
                  {banner.start_date && <span>Starts: {new Date(banner.start_date).toLocaleDateString()}</span>}
                  {banner.end_date && <span>Ends: {new Date(banner.end_date).toLocaleDateString()}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBanners;