import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface VariantOption {
  key: string;
  value: string;
  label?: string;
  colorHex?: string;
  imageIndex?: number;
  priceModifier?: number;
  stock?: number;
}

export interface VariantConfig {
  key: string;
  label: string;
  type: 'swatch' | 'button';
}

interface VariantSelectorProps {
  config: VariantConfig;
  options: VariantOption[];
  selected: string | null;
  onSelect: (value: string) => void;
  onImageChange?: (imageIndex: number) => void;
}

const VariantSelector = ({ config, options, selected, onSelect, onImageChange }: VariantSelectorProps) => {
  if (options.length === 0) return null;

  const handleSelect = (option: VariantOption) => {
    onSelect(option.value);
    if (onImageChange && option.imageIndex !== undefined) {
      onImageChange(option.imageIndex);
    }
  };

  return (
    <div className="mb-4">
      <span className="font-display text-sm uppercase tracking-wider block mb-2">
        {config.label}
        {selected && <span className="text-muted-foreground ml-2 normal-case">— {selected}</span>}
      </span>

      {config.type === 'swatch' ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              disabled={option.stock === 0}
              title={option.label || option.value}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all relative",
                "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected === option.value
                  ? "border-foreground ring-2 ring-foreground/20 scale-110"
                  : "border-border",
                option.stock === 0 && "opacity-30 cursor-not-allowed"
              )}
              style={{ backgroundColor: option.colorHex || 'hsl(var(--muted))' }}
            >
              {option.stock === 0 && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-0.5 bg-destructive rotate-45 absolute" />
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant={selected === option.value ? 'default' : 'outline'}
              disabled={option.stock === 0}
              onClick={() => handleSelect(option)}
              className="min-w-[60px]"
              size="sm"
            >
              {option.label || option.value}
              {option.stock !== undefined && option.stock > 0 && option.stock <= 5 && (
                <span className="ml-1 text-xs opacity-70">({option.stock})</span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Small color dots for ProductCard */
export const ColorDots = ({ 
  colors, 
  maxShow = 5 
}: { 
  colors: { value: string; colorHex: string }[]; 
  maxShow?: number;
}) => {
  if (colors.length === 0) return null;
  const visible = colors.slice(0, maxShow);
  const remaining = colors.length - maxShow;

  return (
    <div className="flex items-center gap-1 mt-1">
      {visible.map((c) => (
        <span
          key={c.value}
          className="w-3 h-3 rounded-full border border-border"
          style={{ backgroundColor: c.colorHex }}
          title={c.value}
        />
      ))}
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground">+{remaining}</span>
      )}
    </div>
  );
};

export default VariantSelector;
