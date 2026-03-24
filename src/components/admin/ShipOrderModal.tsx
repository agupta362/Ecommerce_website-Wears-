import { useState, useEffect } from 'react';
import { Package, Truck, Weight, FileText, DollarSign, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateNCMShipment } from '@/hooks/useNCM';
import { DbOrder } from '@/hooks/useOrders';

interface ShipOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: DbOrder | null;
}

const DELIVERY_TYPES = [
  { value: 'Door2Door', label: 'Door to Door', description: 'Pickup from your door, deliver to customer door' },
  { value: 'Door2Branch', label: 'Door to Branch', description: 'Pickup from your door, customer picks up at branch' },
  { value: 'Branch2Door', label: 'Branch to Door', description: 'Drop at branch, deliver to customer door' },
  { value: 'Branch2Branch', label: 'Branch to Branch', description: 'Drop at branch, customer picks up at branch' },
];

export default function ShipOrderModal({ open, onOpenChange, order }: ShipOrderModalProps) {
  const createShipment = useCreateNCMShipment();
  
  const [deliveryType, setDeliveryType] = useState('Door2Door');
  const [weight, setWeight] = useState('0.5');
  const [packageDescription, setPackageDescription] = useState('');
  const [codConfirmed, setCodConfirmed] = useState(false);

  // Reset COD confirmation based on payment method when order changes
  useEffect(() => {
    setCodConfirmed(order?.payment_method === 'cod');
  }, [order]);

  const handleSubmit = async () => {
    if (!order) return;

    const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 1;
    const description = packageDescription || `${itemCount} jersey(s) - ${order.order_number}`;

    await createShipment.mutateAsync({
      orderId: order.id,
      deliveryType,
      packageDescription: description,
      weight: parseFloat(weight) || 0.5,
      codConfirmed,
    });

    onOpenChange(false);
  };

  if (!order) return null;

  const isCOD = order.payment_method === 'cod';
  const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Create NCM Shipment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order Info */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-1">
            <p className="font-mono font-medium">{order.order_number}</p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_address.fullName} • {order.shipping_address.city}
            </p>
            <p className="text-sm text-muted-foreground">
              {itemCount} item{itemCount !== 1 ? 's' : ''} • Rs. {order.total.toLocaleString()}
            </p>
          </div>

          {/* Delivery Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery Type
            </Label>
            <Select value={deliveryType} onValueChange={setDeliveryType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Weight className="h-4 w-4" />
              Package Weight (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0.5"
            />
            <p className="text-xs text-muted-foreground">
              Typical: 0.3kg per jersey
            </p>
          </div>

          {/* Package Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Package Description (Optional)
            </Label>
            <Textarea
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              placeholder={`${itemCount} jersey(s) - ${order.order_number}`}
              rows={2}
            />
          </div>

          {/* COD Confirmation */}
          {isCOD && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Collect on Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Amount: Rs. {order.total.toLocaleString()}
                  </p>
                </div>
              </div>
              <Switch
                checked={codConfirmed}
                onCheckedChange={setCodConfirmed}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createShipment.isPending}>
            {createShipment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Shipment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
