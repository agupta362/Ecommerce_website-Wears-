import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, User, Truck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNCMComments, useAddNCMComment, useLocalNCMComments } from '@/hooks/useNCM';

interface NCMCommentsPanelProps {
  orderId: string;
  ncmOrderId?: number | null;
}

export default function NCMCommentsPanel({ orderId, ncmOrderId }: NCMCommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [ncmComments, setNcmComments] = useState<any[]>([]);
  
  const fetchComments = useNCMComments();
  const addComment = useAddNCMComment();
  const { data: localComments } = useLocalNCMComments(orderId);

  const loadComments = async () => {
    if (!ncmOrderId) return;
    try {
      const result = await fetchComments.mutateAsync({ orderId, ncmOrderId });
      if (result.success && result.comments) {
        setNcmComments(result.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    if (ncmOrderId) {
      loadComments();
    }
  }, [ncmOrderId]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !ncmOrderId) return;
    
    await addComment.mutateAsync({
      orderId,
      ncmOrderId,
      comment: newComment.trim(),
    });
    
    setNewComment('');
    loadComments();
  };

  // Combine local and NCM comments - with defensive Array.isArray checks
  const allComments = [
    ...(Array.isArray(localComments) ? localComments : []).map(c => ({
      ...c,
      source: 'local' as const,
    })),
    ...(Array.isArray(ncmComments) ? ncmComments : []).map(c => ({
      ...c,
      source: 'ncm' as const,
    })),
  ].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

  if (!ncmOrderId) {
    return (
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            NCM Comments
          </CardTitle>
        </CardHeader>
        <CardContent className="py-4 text-center text-muted-foreground text-sm">
          No NCM shipment created yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            NCM Comments
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadComments}
            disabled={fetchComments.isPending}
          >
            <RefreshCw className={`h-3 w-3 ${fetchComments.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Comments List */}
        <div className="max-h-48 overflow-y-auto space-y-2">
          {allComments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet
            </p>
          ) : (
            allComments.map((comment, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  comment.is_vendor
                    ? 'bg-primary/10 ml-4'
                    : 'bg-muted/50 mr-4'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {comment.is_vendor ? (
                    <User className="h-3 w-3" />
                  ) : (
                    <Truck className="h-3 w-3" />
                  )}
                  <span className="font-medium text-xs">
                    {comment.author || (comment.is_vendor ? 'You' : 'NCM')}
                  </span>
                  {comment.source === 'local' && (
                    <Badge variant="outline" className="text-xs py-0">Local</Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{comment.comment}</p>
                {comment.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2 pt-2 border-t">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Send message to NCM courier..."
            rows={2}
            className="flex-1 text-sm"
          />
          <Button
            size="icon"
            onClick={handleSendComment}
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
