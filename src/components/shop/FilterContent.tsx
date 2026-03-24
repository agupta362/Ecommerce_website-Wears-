import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { siteConfig } from '@/config/site.config';

// Pull sizes and categories from your siteConfig
const sizes = siteConfig.products.sizes;
// Grabbing the clothing categories you defined in your config
const categories = siteConfig.shop.filterOptions.clothing.category; 

interface FilterContentProps {
  priceFilterRange: { min: number; max: number; step: number };
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
  
  // ADDED THIS: We need props to handle category clicks
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const FilterContent = memo(({
  priceFilterRange,
  priceRange,
  onPriceRangeChange,
  selectedSizes,
  onSizesChange,
  selectedCategories,     // ADDED THIS
  onCategoriesChange,     // ADDED THIS
  hasActiveFilters,
  onClearFilters,
}: FilterContentProps) => {

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizesChange(selectedSizes.filter(s => s !== size));
    } else {
      onSizesChange([...selectedSizes, size]);
    }
  };

  // ADDED THIS: Function to handle category clicks
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-6">

      {/* NEW SECTION: Categories */}
      <div>
        <h4 className="font-display text-sm uppercase tracking-wider mb-3">
          Category
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategories?.includes(category) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-display text-sm uppercase tracking-wider mb-3">
          Price Range
        </h4>

        <div className="px-2">
          <Slider
            value={priceRange}
            min={priceFilterRange.min}
            max={priceFilterRange.max}
            step={priceFilterRange.step}
            onValueChange={onPriceRangeChange}
          />

          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span className="font-medium">
              Rs. {priceRange[0].toLocaleString()}
            </span>
            <span className="font-medium">
              Rs. {priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="font-display text-sm uppercase tracking-wider mb-3">
          Size
        </h4>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSizes?.includes(size) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSize(size)}
              className="min-w-[40px]"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onClearFilters}
        >
          Clear All Filters
        </Button>
      )}

    </div>
  );
});

FilterContent.displayName = 'FilterContent';

export default FilterContent;