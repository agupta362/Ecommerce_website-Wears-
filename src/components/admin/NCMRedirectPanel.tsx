import { useState } from 'react';
import { MapPin, Phone, DollarSign, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRedirectOrder, useNCMBranches } from '@/hooks/useNCM';

interface NCMRedirectPanelProps {
  orderId: string;
  ncmOrderId: number;
  currentAddress?: string;
  currentBranch?: string;
  currentPhone?: string;
  currentCod?: number;
}

export default function NCMRedirectPanel({
  orderId,
  ncmOrderId,
  currentAddress,
  currentBranch,
  currentPhone,
  currentCod,
}: NCMRedirectPanelProps) {
  const [newAddress, setNewAddress] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCod, setNewCod] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: branches } = useNCMBranches();
  const redirectOrder = useRedirectOrder();

  const handleRedirect = async () => {
    const payload: Parameters<typeof redirectOrder.mutateAsync>[0] = {
      orderId,
    };

    if (newAddress.trim()) payload.newAddress = newAddress.trim();
    if (newBranch) payload.newBranch = newBranch;
    if (newPhone.trim()) payload.newPhone = newPhone.trim();
    if (newCod) payload.newCod = parseInt(newCod, 10);

    // At least one field must be provided
    if (!payload.newAddress && !payload.newBranch && !payload.newPhone && !payload.newCod) {
      return;
    }

    await redirectOrder.mutateAsync(payload);
    
    // Reset form
    setNewAddress('');
    setNewBranch('');
    setNewPhone('');
    setNewCod('');
    setIsExpanded(false);
  };

  const hasChanges = newAddress.trim() || newBranch || newPhone.trim() || newCod;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Redirect Order
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Change delivery address, branch, phone, or COD amount for NCM order #{ncmOrderId}
        </p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Current Values */}
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
            <p><strong>Current:</strong></p>
            {currentAddress && <p>Address: {currentAddress}</p>}
            {currentBranch && <p>Branch: {currentBranch}</p>}
            {currentPhone && <p>Phone: {currentPhone}</p>}
            {currentCod !== undefined && <p>COD: Rs. {currentCod}</p>}
          </div>

          {/* New Address */}
          <div className="space-y-2">
            <Label htmlFor="new-address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              New Address
            </Label>
            <Input
              id="new-address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter new delivery address..."
            />
          </div>

          {/* New Branch */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              New Destination Branch
            </Label>
            <Select value={newBranch} onValueChange={(val) => setNewBranch(val === "__none__" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No change</SelectItem>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.branch_name}>
                    {branch.branch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Phone */}
          <div className="space-y-2">
            <Label htmlFor="new-phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              New Phone Number
            </Label>
            <Input
              id="new-phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="98XXXXXXXX"
              type="tel"
            />
          </div>

          {/* New COD */}
          <div className="space-y-2">
            <Label htmlFor="new-cod" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              New COD Amount
            </Label>
            <Input
              id="new-cod"
              value={newCod}
              onChange={(e) => setNewCod(e.target.value)}
              placeholder="Enter new COD amount (Rs.)"
              type="number"
              min="0"
            />
          </div>

          <Button
            onClick={handleRedirect}
            disabled={redirectOrder.isPending || !hasChanges}
            className="w-full"
          >
            {redirectOrder.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Redirect Order
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
