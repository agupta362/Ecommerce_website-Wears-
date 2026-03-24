import { useState } from 'react';
import { Ticket, Plus, X, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNCMTickets, useCreateNCMTicket, useCloseNCMTicket } from '@/hooks/useNCM';

interface NCMTicketsPanelProps {
  orderId: string;
}

export default function NCMTicketsPanel({ orderId }: NCMTicketsPanelProps) {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data: tickets, isLoading } = useNCMTickets(orderId);
  const createTicket = useCreateNCMTicket();
  const closeTicket = useCloseNCMTicket();

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return;

    await createTicket.mutateAsync({
      orderId,
      subject: subject.trim(),
      message: message.trim(),
    });

    setSubject('');
    setMessage('');
    setShowNewTicketForm(false);
  };

  const handleCloseTicket = async (ticketId: string, ncmTicketId?: number | null) => {
    await closeTicket.mutateAsync({
      ticketId,
      ncmTicketId: ncmTicketId || undefined,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Support Tickets
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          >
            {showNewTicketForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                New Ticket
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Ticket Form */}
        {showNewTicketForm && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">Subject</Label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Delivery issue, Wrong address..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket-message">Message</Label>
              <Textarea
                id="ticket-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={3}
              />
            </div>
            <Button
              onClick={handleCreateTicket}
              disabled={createTicket.isPending || !subject.trim() || !message.trim()}
              className="w-full"
            >
              {createTicket.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Ticket'
              )}
            </Button>
          </div>
        )}

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets && tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ticket.subject}</span>
                      <Badge
                        variant={ticket.status === 'open' ? 'default' : 'secondary'}
                      >
                        {ticket.status}
                      </Badge>
                      {ticket.ncm_ticket_id && (
                        <Badge variant="outline" className="text-xs">
                          NCM #{ticket.ncm_ticket_id}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Clock className="h-3 w-3" />
                      {new Date(ticket.created_at!).toLocaleString()}
                    </div>
                  </div>
                  {ticket.status === 'open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCloseTicket(ticket.id, ticket.ncm_ticket_id)}
                      disabled={closeTicket.isPending}
                    >
                      {closeTicket.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No support tickets for this order
          </p>
        )}
      </CardContent>
    </Card>
  );
}
