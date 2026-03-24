import { Package, Truck, CheckCircle, Clock, MapPin, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderTrackingTimelineProps {
  orderStatus: string;
  ncmStatus?: string | null;
  ncmOrderId?: number | null;
  ncmTrackingId?: string | null;
}

const ORDER_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: Package, ncmStatuses: [] },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle, ncmStatuses: [] },
  { status: 'processing', label: 'Processing', icon: Clock, ncmStatuses: ['Pickup Order Created'] },
  { status: 'shipped', label: 'Shipped', icon: Truck, ncmStatuses: ['Sent for Pickup', 'Pickup Complete', 'Sent for Delivery'] },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin, ncmStatuses: ['Out for Delivery'] },
  { status: 'delivered', label: 'Delivered', icon: Home, ncmStatuses: ['Delivered'] },
];

export default function OrderTrackingTimeline({
  orderStatus,
  ncmStatus,
  ncmOrderId,
  ncmTrackingId,
}: OrderTrackingTimelineProps) {
  // Determine current step based on order status and NCM status
  const getCurrentStep = () => {
    if (orderStatus === 'cancelled') return -1;
    
    // Check NCM status first for more granular tracking
    if (ncmStatus) {
      for (let i = ORDER_STEPS.length - 1; i >= 0; i--) {
        if (ORDER_STEPS[i].ncmStatuses.includes(ncmStatus)) {
          return i;
        }
      }
    }
    
    // Fall back to order status
    const statusIndex = ORDER_STEPS.findIndex(s => s.status === orderStatus);
    return statusIndex >= 0 ? statusIndex : 0;
  };

  const currentStep = getCurrentStep();

  if (orderStatus === 'cancelled') {
    return (
      <div className="text-center py-6">
        <Badge variant="destructive" className="text-sm px-4 py-1">
          Order Cancelled
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* NCM Tracking Info */}
      {ncmOrderId && (
        <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">NCM ID:</span>
            <span className="font-mono font-medium">{ncmOrderId}</span>
          </div>
          {ncmTrackingId && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tracking:</span>
              <span className="font-mono font-medium">{ncmTrackingId}</span>
            </div>
          )}
          {ncmStatus && (
            <Badge variant="secondary">{ncmStatus}</Badge>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        <div 
          className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500"
          style={{ 
            height: `${Math.max(0, ((currentStep) / (ORDER_STEPS.length - 1)) * 100)}%` 
          }}
        />

        {/* Steps */}
        <div className="space-y-6">
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const StepIcon = step.icon;

            return (
              <div key={step.status} className="relative flex items-center gap-4">
                <div
                  className={`
                    relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                    ${isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border text-muted-foreground'}
                    ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
                  `}
                >
                  <StepIcon className="h-4 w-4" />
                </div>
                <div className={`flex-1 ${isCompleted ? '' : 'opacity-50'}`}>
                  <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                    {step.label}
                  </p>
                  {isCurrent && ncmStatus && step.ncmStatuses.includes(ncmStatus) && (
                    <p className="text-sm text-muted-foreground">{ncmStatus}</p>
                  )}
                </div>
                {isCurrent && (
                  <Badge variant="secondary" className="text-xs">Current</Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
