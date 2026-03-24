import { Shield, Truck, RefreshCw, Award } from 'lucide-react';
import { siteConfig } from '@/config/site.config';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Shield,
  Truck,
  RefreshCw,
  Award,
};

const TrustBadges = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {siteConfig.trustBadges.map((badge) => {
        const Icon = iconMap[badge.icon] || Shield;
        return (
          <div
            key={badge.title}
            className="flex flex-col items-center text-center p-4 bg-secondary-foreground/5 rounded-lg"
          >
            <Icon className="h-6 w-6 text-primary mb-2" />
            <h4 className="font-display text-sm uppercase tracking-wide text-secondary-foreground">
              {badge.title}
            </h4>
            <p className="text-xs text-secondary-foreground/70 mt-1">
              {badge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default TrustBadges;
