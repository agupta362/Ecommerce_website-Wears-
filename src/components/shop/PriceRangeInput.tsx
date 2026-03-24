import React, { useState, useEffect, memo } from 'react';
import { Input } from '@/components/ui/input';

interface PriceRangeInputProps {
  priceStats: { min: number; max: number };
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
}

/**
 * Separate memoized component for price range inputs.
 * Uses local state to prevent re-renders on each keystroke,
 * which was causing the keyboard to close on mobile.
 */
const PriceRangeInput = memo(({ priceStats, priceRange, onPriceChange }: PriceRangeInputProps) => {
  // Local state for input values - prevents re-render on each keystroke
  const [localMin, setLocalMin] = useState(priceRange[0].toString());
  const [localMax, setLocalMax] = useState(priceRange[1].toString());
  
  // Sync when external priceRange changes (e.g., from slider)
  useEffect(() => {
    setLocalMin(priceRange[0].toString());
    setLocalMax(priceRange[1].toString());
  }, [priceRange[0], priceRange[1]]);
  
  // Apply validated values on blur
  const handleBlur = () => {
    const min = parseInt(localMin) || priceStats.min;
    const max = parseInt(localMax) || priceStats.max;
    const validMin = Math.max(priceStats.min, Math.min(min, max));
    const validMax = Math.min(priceStats.max, Math.max(min, max));
    onPriceChange([validMin, validMax]);
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={`Min (${priceStats.min})`}
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          onBlur={handleBlur}
          className="h-8 text-xs"
        />
      </div>
      <span className="text-muted-foreground">-</span>
      <div className="flex-1">
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={`Max (${priceStats.max})`}
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          onBlur={handleBlur}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
});

PriceRangeInput.displayName = 'PriceRangeInput';

export default PriceRangeInput;
