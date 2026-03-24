import { useState } from 'react';
import { RotateCcw, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useReturnOrder, useExchangeOrder } from '@/hooks/useNCM';
import OrderSupportTicket from './OrderSupportTicket';

interface OrderActionsProps {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  ncmOrderId?: number | null;
}

export default function OrderActions({ orderId, orderNumber, orderStatus, ncmOrderId }: OrderActionsProps) {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [reason, setReason] = useState('');
  
  const returnOrder = useReturnOrder();
  const exchangeOrder = useExchangeOrder();

  // Only show actions for delivered orders with NCM shipment
  const canRequestReturn = orderStatus === 'delivered' && ncmOrderId;
  const canRequestExchange = orderStatus === 'delivered' && ncmOrderId;
  
  // Show support ticket for any order
  const canRequestSupport = ['shipped', 'delivered'].includes(orderStatus);

  if (!canRequestReturn && !canRequestExchange && !canRequestSupport) {
    return null;
  }

  const handleReturn = async () => {
    await returnOrder.mutateAsync({
      orderId,
      reason: reason.trim() || undefined,
    });
    setShowReturnModal(false);
    setReason('');
  };

  const handleExchange = async () => {
    await exchangeOrder.mutateAsync({
      orderId,
      reason: reason.trim() || undefined,
    });
    setShowExchangeModal(false);
    setReason('');
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
        {canRequestReturn && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReturnModal(true)}
            className="flex-1 min-w-[140px]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Request Return
          </Button>
        )}
        {canRequestExchange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExchangeModal(true)}
            className="flex-1 min-w-[140px]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Exchange
          </Button>
        )}
        {canRequestSupport && (
          <OrderSupportTicket orderId={orderId} orderNumber={orderNumber} />
        )}
      </div>

      {/* Return Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Submit a return request for this order. Our team will contact you with further instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="return-reason">Reason for Return (Optional)</Label>
            <Textarea
              id="return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Wrong size, defective item, changed mind..."
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} disabled={returnOrder.isPending}>
              {returnOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exchange Modal */}
      <Dialog open={showExchangeModal} onOpenChange={setShowExchangeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Exchange</DialogTitle>
            <DialogDescription>
              Submit an exchange request for this order. Our team will contact you to arrange the exchange.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="exchange-reason">Reason for Exchange</Label>
            <Textarea
              id="exchange-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Need a different size (M instead of L)..."
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExchangeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleExchange} disabled={exchangeOrder.isPending}>
              {exchangeOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Exchange Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
