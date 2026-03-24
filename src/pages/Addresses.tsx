import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PageBreadcrumbs from '@/components/ui/PageBreadcrumbs';
import { MapPin, Plus, Pencil, Trash2, Star, Package, Heart, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useMyAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, DbAddress } from '@/hooks/useAddresses';


const emptyAddress = {
  full_name: '',
  phone: '',
  district: '',
  city: '',
  address_line1: '',
  address_line2: '',
  label: 'Home',
  is_default: false,
};

const Addresses = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAdmin } = useAuth();
  const { data: addresses, isLoading } = useMyAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DbAddress | null>(null);
  const [formData, setFormData] = useState(emptyAddress);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleOpenDialog = (address?: DbAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        full_name: address.full_name,
        phone: address.phone,
        district: address.district,
        city: address.city,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || '',
        label: address.label || 'Home',
        is_default: address.is_default,
      });
    } else {
      setEditingAddress(null);
      setFormData(emptyAddress);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      await updateAddress.mutateAsync({ id: editingAddress.id, ...formData });
    } else {
      await createAddress.mutateAsync(formData);
    }
    
    setDialogOpen(false);
    setFormData(emptyAddress);
    setEditingAddress(null);
  };

  const handleDelete = async (id: string) => {
    await deleteAddress.mutateAsync(id);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-6 sm:py-12">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <PageBreadcrumbs 
            items={[
              { label: 'Account', href: '/account' },
              { label: 'Addresses' }
            ]} 
            className="mb-6"
          />
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-2">
              <div className="bg-card border rounded-lg p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user.email}</p>
                    {isAdmin && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Button asChild variant="outline" className="w-full mb-2">
                    <Link to="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}
              </div>

              <nav className="bg-card border rounded-lg overflow-hidden">
                <Link to="/account" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>Wishlist</span>
                </Link>
                <Link to="/account/addresses" className="flex items-center gap-3 p-4 bg-muted/50 border-l-4 border-primary">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Addresses</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/30 transition-colors text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-2xl uppercase tracking-wider">My Addresses</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="district">District</Label>
                          <Input
                            id="district"
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address_line1">Address Line 1</Label>
                        <Input
                          id="address_line1"
                          value={formData.address_line1}
                          onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                        <Input
                          id="address_line2"
                          value={formData.address_line2}
                          onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="label">Label</Label>
                        <Input
                          id="label"
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          placeholder="Home, Office, etc."
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="is_default"
                          checked={formData.is_default}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                        />
                        <Label htmlFor="is_default">Set as default address</Label>
                      </div>
                      <Button type="submit" className="w-full" disabled={createAddress.isPending || updateAddress.isPending}>
                        {editingAddress ? 'Update Address' : 'Add Address'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="grid gap-4">
                  {addresses.map(address => (
                    <div key={address.id} className="bg-card border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{address.full_name}</span>
                            {address.label && (
                              <Badge variant="outline">{address.label}</Badge>
                            )}
                            {address.is_default && (
                              <Badge className="bg-primary/10 text-primary">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                          <p className="text-sm mt-2">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm">{address.city}, {address.district}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(address)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Address?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(address.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card border rounded-lg">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-lg mb-2">No addresses yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first delivery address</p>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Addresses;
