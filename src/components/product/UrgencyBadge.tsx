import { Flame } from 'lucide-react';

interface UrgencyBadgeProps {
  stock: number;
  showViewers?: boolean;
}

const UrgencyBadge = ({ stock }: UrgencyBadgeProps) => {
  if (stock === 0 || stock > 5) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-destructive">
      <Flame className="h-3.5 w-3.5" />
      <span>Only {stock} left!</span>
    </div>
  );
};

export default UrgencyBadge;
