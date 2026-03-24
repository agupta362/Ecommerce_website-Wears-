import { useState } from 'react';
import { HelpCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useCreateNCMTicket } from '@/hooks/useNCM';

interface OrderSupportTicketProps {
  orderId: string;
  orderNumber: string;
}

export default function OrderSupportTicket({ orderId, orderNumber }: OrderSupportTicketProps) {
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const createTicket = useCreateNCMTicket();

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;

    await createTicket.mutateAsync({
      orderId,
      subject: subject.trim(),
      message: message.trim(),
    });

    setSubject('');
    setMessage('');
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Need Help?
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Need help with order {orderNumber}? Send us a message and we'll get back to you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Delivery issue, Wrong item received..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTicket.isPending || !subject.trim() || !message.trim()}
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
