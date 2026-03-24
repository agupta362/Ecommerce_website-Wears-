import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Link as LinkIcon, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminGalleryImages, useCreateGalleryImage, useUpdateGalleryImage, useDeleteGalleryImage, GalleryImage } from '@/hooks/useGallery';
import { useAdminProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';

const AdminGallery = () => {
  const { toast } = useToast();
  const { data: images, isLoading } = useAdminGalleryImages();
  const { data: products } = useAdminProducts();
  const createMutation = useCreateGalleryImage();
  const updateMutation = useUpdateGalleryImage();
  const deleteMutation = useDeleteGalleryImage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    product_id: '',
    display_size: 'medium' as 'small' | 'medium' | 'large' | 'tall',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      image_url: '',
      title: '',
      description: '',
      product_id: '',
      display_size: 'medium',
      is_active: true,
      display_order: images?.length || 0,
    });
    setEditingImage(null);
  };

  const openEditDialog = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      image_url: image.image_url,
      title: image.title,
      description: image.description || '',
      product_id: image.product_id || '',
      display_size: image.display_size,
      is_active: image.is_active,
      display_order: image.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 5MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-${Date.now()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url || !formData.title) {
      toast({ title: 'Missing fields', description: 'Please fill in image and title', variant: 'destructive' });
      return;
    }

    try {
      const submitData = {
        ...formData,
        product_id: formData.product_id || null,
        description: formData.description || null,
      };

      if (editingImage) {
        await updateMutation.mutateAsync({ id: editingImage.id, ...submitData });
        toast({ title: 'Image updated successfully' });
      } else {
        await createMutation.mutateAsync(submitData);
        toast({ title: 'Image added to The Legends Vault' });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Failed to save', description: 'Please try again', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image from the gallery?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Image deleted' });
    } catch (error) {
      console.error('Delete error:', error);
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const toggleActive = async (image: GalleryImage) => {
    try {
      await updateMutation.mutateAsync({ id: image.id, is_active: !image.is_active });
      toast({ title: image.is_active ? 'Image hidden' : 'Image visible' });
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const getSizeBadge = (size: string) => {
    const colors: Record<string, string> = {
      small: 'bg-blue-100 text-blue-800',
      medium: 'bg-green-100 text-green-800',
      large: 'bg-purple-100 text-purple-800',
      tall: 'bg-orange-100 text-orange-800',
    };
    return colors[size] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-wider">The Legends Vault</h1>
          <p className="text-muted-foreground">Curate legendary football images and link them to products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="font-display uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display uppercase tracking-wider">
                {editingImage ? 'Edit Gallery Image' : 'Add to The Legends Vault'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Image *</Label>
                {formData.image_url ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">Upload a legendary image</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="max-w-xs mx-auto"
                    />
                    {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Ronaldo's Champions League Glory"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell the story behind this moment..."
                  rows={3}
                />
              </div>

              {/* Display Size */}
              <div className="space-y-2">
                <Label>Display Size</Label>
                <Select
                  value={formData.display_size}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, display_size: val as typeof formData.display_size }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1 row)</SelectItem>
                    <SelectItem value="medium">Medium (2 rows)</SelectItem>
                    <SelectItem value="large">Large (2 rows, 2 columns)</SelectItem>
                    <SelectItem value="tall">Tall (3 rows)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Controls the image size in the masonry grid</p>
              </div>

              {/* Link to Product */}
              <div className="space-y-2">
                <Label>Link to Product (Optional)</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, product_id: val === 'none' ? '' : val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product to link" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="none">No product link</SelectItem>
                    {products?.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Link an image to a product to show "Shop This Look" button
                </p>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible</Label>
                  <p className="text-xs text-muted-foreground">Show this image in the gallery</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingImage ? 'Update' : 'Add to Vault'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
            </Card>
          ))}
        </div>
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className={`group overflow-hidden ${!image.is_active ? 'opacity-50' : ''}`}>
              <div className="relative aspect-square">
                <img src={image.image_url} alt={image.title} className="w-full h-full object-cover" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEditDialog(image)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => toggleActive(image)}>
                    {image.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(image.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  <Badge className={getSizeBadge(image.display_size)} variant="secondary">
                    {image.display_size}
                  </Badge>
                  {image.product_id && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent">
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Linked
                    </Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{image.title}</p>
                    {image.products && (
                      <p className="text-xs text-muted-foreground truncate">→ {image.products.name}</p>
                    )}
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-display text-xl uppercase tracking-wider mb-2">No Images Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start curating The Legends Vault by adding legendary football images
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Image
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AdminGallery;
