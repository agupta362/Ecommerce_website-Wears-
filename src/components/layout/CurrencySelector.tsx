import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency, CurrencyCode } from '@/context/CurrencyContext';
import { cn } from '@/lib/utils';

const CurrencySelector = () => {
  const { currency, setCurrency, currencies } = useCurrency();

  const currencyList = Object.values(currencies) as { code: CurrencyCode; symbol: string; name: string }[];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-display uppercase tracking-wider">
          <Globe className="h-3.5 w-3.5" />
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {currencyList.map((c) => (
          <DropdownMenuItem
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              currency === c.code && "bg-accent/10 font-medium"
            )}
          >
            <span>{c.symbol} {c.code}</span>
            <span className="text-xs text-muted-foreground">{c.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CurrencySelector;
