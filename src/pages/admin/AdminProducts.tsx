import { useState } from 'react';
import { 
  Search, 
  Plus,
  Edit,
  Package,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdminProducts, useCategories, useCreateProduct, useUpdateProduct, useUpdateStock, DbProduct } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/admin/ImageUpload';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [stockEditProduct, setStockEditProduct] = useState<string | null>(null);
  const [stockValues, setStockValues] = useState<Record<string, number>>({});
  
  const { data: products, isLoading } = useAdminProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const updateStock = useUpdateStock();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    category_id: '',
    is_featured: false,
    is_new: false,
    is_active: true,
    is_clearance: false,
    images: [] as string[],
    sizes: sizes.map(s => ({ size: s, stock: 0 })),
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      original_price: '',
      category_id: '',
      is_featured: false,
      is_new: false,
      is_active: true,
      is_clearance: false,
      images: [],
      sizes: sizes.map(s => ({ size: s, stock: 0 })),
    });
  };

  const openEditDialog = (product: DbProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      original_price: product.original_price?.toString() || '',
      category_id: product.category_id || '',
      is_featured: product.is_featured,
      is_new: product.is_new,
      is_active: product.is_active,
      is_clearance: product.is_clearance || false,
      images: product.images || [],
      sizes: sizes.map(s => {
        const existing = product.product_sizes?.find(ps => ps.size === s);
        return { size: s, stock: existing?.stock || 0 };
      }),
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        category_id: formData.category_id || null,
        images: formData.images,
        is_featured: formData.is_featured,
        is_new: formData.is_new,
        is_active: formData.is_active,
        is_clearance: formData.is_clearance,
      });
      
      // Update stock for each size
      for (const sizeItem of formData.sizes) {
        await updateStock.mutateAsync({
          productId: editingProduct.id,
          size: sizeItem.size,
          stock: sizeItem.stock,
        });
      }
      
      toast({ title: 'Product updated successfully' });
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      toast({ title: 'Error updating product', variant: 'destructive' });
    }
  };

  const handleCreateProduct = async () => {
  try {
    await createProduct.mutateAsync({
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description || null,
      price: parseFloat(formData.price) || 0,
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category_id: formData.category_id || null,
      images: Array.isArray(formData.images) ? formData.images : [],
      is_featured: !!formData.is_featured,
      is_new: !!formData.is_new,
      is_active: !!formData.is_active,
      is_clearance: !!formData.is_clearance,
      sizes: Array.isArray(formData.sizes) ? formData.sizes.filter(s => s.stock > 0) : [],
    });
    
    toast({ title: 'Product created successfully' });
    setIsAddDialogOpen(false);
    resetForm();
  } catch (error) {
    console.error("Create product failed:", error);
    toast({ title: 'Error creating product', variant: 'destructive' });
  }
};


  // const handleCreateProduct = async () => {
  //   try {
  //     await createProduct.mutateAsync({
  //       name: formData.name,
  //       slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
  //       description: formData.description,
  //       price: parseFloat(formData.price),
  //       original_price: formData.original_price ? parseFloat(formData.original_price) : null,
  //       category_id: formData.category_id || null,
  //       league: formData.league || null,
  //       club: formData.club || null,
  //       era: formData.era || null,
  //       kit_type: formData.kit_type,
  //       images: formData.images,
  //       is_featured: formData.is_featured,
  //       is_new: formData.is_new,
  //       is_active: formData.is_active,
  //       is_clearance: formData.is_clearance,
  //       sizes: formData.sizes.filter(s => s.stock > 0),
  //     });
      
  //     toast({ title: 'Product created successfully' });
  //     setIsAddDialogOpen(false);
  //     resetForm();
  //   } catch (error) {
  //     toast({ title: 'Error creating product', variant: 'destructive' });
  //   }
  // };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      await updateProduct.mutateAsync({ id: productId, is_active: !isActive });
      toast({ title: `Product ${!isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
      toast({ title: 'Error updating product', variant: 'destructive' });
    }
  };

  const handleSaveStock = async (productId: string) => {
    try {
      for (const [size, stock] of Object.entries(stockValues)) {
        await updateStock.mutateAsync({ productId, size, stock });
      }
      toast({ title: 'Stock updated successfully' });
      setStockEditProduct(null);
      setStockValues({});
    } catch (error) {
      toast({ title: 'Error updating stock', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl uppercase tracking-wider mb-2">Products</h2>
          <p className="text-muted-foreground">Manage your product catalog and inventory</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map(product => {
                  const totalStock = product.product_sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
                  const isLowStock = totalStock < 10 && totalStock > 0;
                  const isOutOfStock = totalStock === 0;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover rounded" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground"> {categories?.find(c => c.id === product.category_id)?.name || ''} </p>
                            
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(product.price)}</p>
                          {product.original_price && (
                            <p className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.original_price)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {isOutOfStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {totalStock} left
                            </Badge>
                          ) : (
                            <Badge variant="outline">{totalStock} in stock</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStockEditProduct(product.id);
                              // Security: Use Map to prevent prototype pollution
                              const stockMap = new Map<string, number>();
                              product.product_sizes?.forEach(s => {
                                stockMap.set(s.size, s.stock);
                              });
                              setStockValues(Object.fromEntries(stockMap));
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.is_active ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700">Inactive</Badge>
                          )}
                          {product.is_featured && <Badge>Featured</Badge>}
                          {product.is_new && <Badge variant="secondary">New</Badge>}
                          {product.is_clearance && <Badge variant="destructive">Clearance</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(product.id, product.is_active)}
                          >
                            {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first product'}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Add New Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Manchester United 1998-99 Home Kit"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (Rs.) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="3500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (Rs.)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="4200"
                />
              </div>
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="club">Club</Label>
                <Input
                  id="club"
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  placeholder="Manchester United"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="league">League</Label>
                <Input
                  id="league"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                  placeholder="Premier League"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="era">Era</Label>
                <Select value={formData.era} onValueChange={(v) => setFormData({ ...formData, era: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select era" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1980s">1980s</SelectItem>
                    <SelectItem value="1990s">1990s</SelectItem>
                    <SelectItem value="2000s">2000s</SelectItem>
                    <SelectItem value="2010s">2010s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kit_type">Kit Type</Label>
                <Select value={formData.kit_type} onValueChange={(v) => setFormData({ ...formData, kit_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="third">Third</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div> */}

            <div className="space-y-2">
              <Label>Product Images</Label>
              <ImageUpload 
                images={formData.images} 
                onImagesChange={(images) => setFormData({ ...formData, images })} 
              />
            </div>

            <div className="space-y-2">
              <Label>Initial Stock per Size</Label>
              <div className="grid grid-cols-5 gap-2">
                {formData.sizes.map((sizeItem, index) => (
                  <div key={sizeItem.size}>
                    <Label className="text-xs text-center block mb-1">{sizeItem.size}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeItem.stock}
                      onChange={(e) => {
                        const newSizes = [...formData.sizes];
                        newSizes[index].stock = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, sizes: newSizes });
                      }}
                      className="text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_new"
                  checked={formData.is_new}
                  onCheckedChange={(v) => setFormData({ ...formData, is_new: v })}
                />
                <Label htmlFor="is_new">New Arrival</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_clearance"
                  checked={formData.is_clearance}
                  onCheckedChange={(v) => setFormData({ ...formData, is_clearance: v })}
                />
                <Label htmlFor="is_clearance">Clearance</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} disabled={!formData.name || !formData.price}>
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => { setEditingProduct(null); resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Product</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (Rs.) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-original_price">Original Price (Rs.)</Label>
                <Input
                  id="edit-original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                />
              </div>
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-club">Club</Label>
                <Input
                  id="edit-club"
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-league">League</Label>
                <Input
                  id="edit-league"
                  value={formData.league}
                  onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-era">Era</Label>
                <Select value={formData.era} onValueChange={(v) => setFormData({ ...formData, era: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select era" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1980s">1980s</SelectItem>
                    <SelectItem value="1990s">1990s</SelectItem>
                    <SelectItem value="2000s">2000s</SelectItem>
                    <SelectItem value="2010s">2010s</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-kit_type">Kit Type</Label>
                <Select value={formData.kit_type} onValueChange={(v) => setFormData({ ...formData, kit_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="third">Third</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div> */}

            <div className="space-y-2">
              <Label>Product Images</Label>
              <ImageUpload 
                images={formData.images} 
                onImagesChange={(images) => setFormData({ ...formData, images })} 
              />
            </div>

            <div className="space-y-2">
              <Label>Stock per Size</Label>
              <div className="grid grid-cols-5 gap-2">
                {formData.sizes.map((sizeItem, index) => (
                  <div key={sizeItem.size}>
                    <Label className="text-xs text-center block mb-1">{sizeItem.size}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={sizeItem.stock}
                      onChange={(e) => {
                        const newSizes = [...formData.sizes];
                        newSizes[index].stock = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, sizes: newSizes });
                      }}
                      className="text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
                />
                <Label htmlFor="edit-is_featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is_new"
                  checked={formData.is_new}
                  onCheckedChange={(v) => setFormData({ ...formData, is_new: v })}
                />
                <Label htmlFor="edit-is_new">New Arrival</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is_clearance"
                  checked={formData.is_clearance}
                  onCheckedChange={(v) => setFormData({ ...formData, is_clearance: v })}
                />
                <Label htmlFor="edit-is_clearance">Clearance</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingProduct(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={!formData.name || !formData.price}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Edit Dialog */}
      <Dialog open={!!stockEditProduct} onOpenChange={() => setStockEditProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Update Stock</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4">
              {sizes.map(size => (
                <div key={size}>
                  <Label className="text-center block mb-2">{size}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={stockValues[size] || 0}
                    onChange={(e) => setStockValues({ ...stockValues, [size]: parseInt(e.target.value) || 0 })}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStockEditProduct(null)}>
              Cancel
            </Button>
            <Button onClick={() => stockEditProduct && handleSaveStock(stockEditProduct)}>
              Save Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
