import { Banknote, CreditCard, Smartphone, Building, Globe, Bitcoin, LucideIcon } from 'lucide-react';
import { siteConfig, PaymentMethod } from '@/config/site.config';

// Icon mapping from string to component
const iconMap: Record<PaymentMethod['icon'], LucideIcon> = {
  Banknote,
  Smartphone,
  Building,
  CreditCard,
  Globe,
  Bitcoin,
};

const PaymentMethods = () => {
  // Filter to only show enabled payment methods
  const enabledMethods = siteConfig.paymentMethods.filter((method) => method.enabled);

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {enabledMethods.map((method) => {
        const IconComponent = iconMap[method.icon];
        return (
          <div
            key={method.id}
            className="flex items-center gap-2 px-3 py-2 bg-secondary-foreground/5 rounded-lg"
          >
            <IconComponent className="h-4 w-4 text-secondary-foreground/70" />
            <span className="text-xs text-secondary-foreground/70">{method.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentMethods;
