import { useState } from 'react';
import { RotateCcw, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface NCMAdminActionsProps {
  orderId: string;
  orderStatus: string;
  ncmOrderId: number;
}

export default function NCMAdminActions({ orderId, orderStatus, ncmOrderId }: NCMAdminActionsProps) {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [reason, setReason] = useState('');

  const returnOrder = useReturnOrder();
  const exchangeOrder = useExchangeOrder();

  // Only allow actions on shipped or delivered orders with NCM
  const canReturn = ['shipped', 'delivered'].includes(orderStatus);
  const canExchange = ['shipped', 'delivered'].includes(orderStatus);

  if (!canReturn && !canExchange) {
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">NCM Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage returns and exchanges for NCM order #{ncmOrderId}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {canReturn && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReturnModal(true)}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Initiate Return
              </Button>
            )}
            {canExchange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExchangeModal(true)}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Create Exchange
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Return Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initiate Return (Admin)</DialogTitle>
            <DialogDescription>
              Submit a return request for NCM order #{ncmOrderId}. This will notify NCM to arrange pickup.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-return-reason">Reason for Return</Label>
            <Textarea
              id="admin-return-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer requested return - wrong size..."
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
                  Processing...
                </>
              ) : (
                'Initiate Return'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exchange Modal */}
      <Dialog open={showExchangeModal} onOpenChange={setShowExchangeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Exchange (Admin)</DialogTitle>
            <DialogDescription>
              Create an exchange order for NCM order #{ncmOrderId}. This will create a new NCM shipment.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="admin-exchange-reason">Reason for Exchange</Label>
            <Textarea
              id="admin-exchange-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer needs size M instead of L..."
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
                  Processing...
                </>
              ) : (
                'Create Exchange'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
