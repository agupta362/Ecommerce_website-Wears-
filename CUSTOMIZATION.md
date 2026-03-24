# 🎨 White-Label Customization Guide

This e-commerce template is designed to be **easily clonable** for different businesses. All customization is centralized in configuration files and database settings.

---

## Quick Start (5 Minutes)

For most customizations, you only need to edit **one file**:

```
src/config/site.config.ts
```

This file contains **ALL** business-specific configuration including:
- Business identity and store type
- Contact information and social media
- Theme colors and fonts
- Payment methods and instructions
- Shipping/NCM courier settings
- SEO meta tags
- Feature toggles
- Shop filters configuration
- Hero carousel settings
- Navigation and footer content

---

## Complete Setup Guide

### Step 1: Update Site Configuration

Open `src/config/site.config.ts` and update each section:

#### Business Identity
```typescript
export const siteConfig = {
  storeType: 'clothing', // 'clothing' | 'jewelry' | 'cosmetics' | 'shoes' | 'electronics' | 'general'
  name: "Your Store Name",
  tagline: "Your Tagline Here",
  description: "SEO description for your store",
  domain: "https://yourdomain.com",
  // ...
};
```

#### Contact Information
```typescript
contact: {
  email: "hello@yourdomain.com",
  phone: "+1 234 567 8900",
  phoneRaw: "12345678900", // For WhatsApp links
  address: {
    street: "123 Main Street",
    city: "Your City",
    country: "Your Country",
    full: "123 Main Street, Your City, Your Country"
  },
  businessHours: {
    weekdays: "Mon-Fri: 9AM-6PM",
    weekends: "Sat: 10AM-4PM"
  }
},
```

#### Theme & Colors
```typescript
theme: {
  colors: {
    light: {
      primary: { h: 150, s: 37, l: 16 },       // Your brand color (HSL)
      secondary: { h: 0, s: 0, l: 10 },        // Secondary color
      success: { h: 145, s: 65, l: 35 },       // Success/positive color
      destructive: { h: 0, s: 84, l: 60 },     // Error/danger color
      // ... other colors
    },
    dark: {
      // Dark mode variants
    },
  },
  fonts: {
    display: "'Oswald', sans-serif",   // Headings
    body: "'Inter', sans-serif",        // Body text
  },
  borderRadius: "0.625rem",
},
```

**Color Format**: All colors use HSL object format: `{ h: hue (0-360), s: saturation (0-100), l: lightness (0-100) }`

---

## Hero Section Configuration

The hero section supports three display modes:

### Video Mode (Default)
```typescript
hero: {
  type: 'video',
  // Content used for all modes
  subtitle: "Your Tagline",
  titleLine1: "Main",
  titleLine2: "Headline",
  description: "Your description text",
  primaryCta: { text: "Shop Now", link: "/shop" },
  secondaryCta: { text: "Learn More", link: "/about" }
}
```

### Image Mode
```typescript
hero: {
  type: 'image',
  // ... same content fields
}
```

### Carousel Mode (Multiple Images)
```typescript
hero: {
  type: 'carousel',
  slides: [
    { id: '1', image: '/hero-slide-1.jpg' },
    { id: '2', image: '/hero-slide-2.jpg', titleLine1: 'Custom', titleLine2: 'Title' },
    { id: '3', image: '/hero-slide-3.jpg' },
  ],
  autoPlayInterval: 5000, // 5 seconds between slides
  showArrows: true,       // Navigation arrows
  showDots: true,         // Dot indicators
  pauseOnHover: true,     // Pause on mouse hover
  // ... same content fields (used as defaults for slides without overrides)
}
```

**Carousel Slide Options:**
Each slide can optionally override the default text:
- `titleLine1` - First line of headline
- `titleLine2` - Second line (highlighted)
- `subtitle` - Top subtitle text
- `description` - Body description

---

## Shop Page Filters

Configure which filters to show and their options:

### Filter Toggles
```typescript
shop: {
  filters: {
    priceRange: true,   // Show price range slider
    category: true,     // Show category filter
    size: true,         // Show size buttons
    league: true,       // Show league checkboxes (clothing)
    era: true,          // Show era checkboxes (vintage stores)
    kitType: true,      // Show kit type buttons (jersey stores)
    material: false,    // Show material filter (jewelry)
    gemstone: false,    // Show gemstone filter (jewelry)
    skinType: false,    // Show skin type filter (cosmetics)
  },
}
```

### Filter Options by Store Type
```typescript
shop: {
  filterOptions: {
    clothing: {
      leagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'International'],
      eras: ['1980s', '1990s', '2000s', '2010s', '2020s'],
      kitTypes: ['home', 'away', 'third', 'special'],
    },
    jewelry: {
      materials: ['Gold', 'Silver', 'Platinum', 'Rose Gold'],
      gemstones: ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Pearl'],
      styles: ['Classic', 'Modern', 'Vintage', 'Minimalist'],
    },
    cosmetics: {
      skinTypes: ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'],
      concerns: ['Anti-aging', 'Acne', 'Hydration', 'Brightening'],
      formulas: ['Cream', 'Serum', 'Gel', 'Oil', 'Powder'],
    },
  },
}
```

### Dynamic Price Range
The price filter automatically:
- Detects min/max prices from your product catalog
- Supports dual-handle range selection
- Allows manual min/max input
- Uses smooth 50 Rs. steps

---

## Shop by Categories

Categories are managed in the Supabase database (`categories` table).

### Adding Categories
1. Go to Supabase Dashboard > Table Editor > categories
2. Add new row with:
   - `name`: Display name (e.g., "Necklaces")
   - `slug`: URL-friendly name (e.g., "necklaces")
   - `description`: Optional description
   - `image_url`: Optional category image

### Category Feature Toggles
```typescript
features: {
  shopByCategory: true,   // Show category grid on homepage
  categoryPage: false,    // Create dedicated /categories page
  categoryImages: true,   // Show images in category cards
},

shop: {
  categoryDisplay: {
    style: 'grid',           // 'grid' | 'list' | 'carousel'
    showProductCount: true,  // Show product count badge
    showDescription: false,  // Show category description
    columnsDesktop: 6,       // Grid columns on desktop
    columnsMobile: 2,        // Grid columns on mobile
  },
}
```

### Linking Products to Categories
When adding products in Admin > Products:
- Select the category from the dropdown
- Products will appear when filtering by that category
- URL format: `/shop?category=category-slug`

---

## Loyalty & Bundle Deals (Admin Configurable)

The loyalty program and bundle deals are now **fully configurable from the Admin Panel**!

### Accessing Settings
1. Login as admin
2. Go to Admin Dashboard > Loyalty & Bundles
3. Configure all settings without code changes

### Loyalty Program Settings
| Setting | Description |
|---------|-------------|
| Enable Loyalty | Turn the entire program on/off |
| Require Sign-up | Whether customers must be logged in (recommended) |
| Free Item After | Number of purchases to earn a free item (default: 9) |
| Free Item Value | Maximum discount value for free item (default: Rs. 1600) |
| Reward Code Expiry | Days until reward codes expire (default: 90) |
| Item Label | How items are referred to ("jersey", "item", "product") |

### Bundle Deal Settings
Each bundle tier can be customized:
| Setting | Description |
|---------|-------------|
| Name | Display name (e.g., "Duo Pack") |
| Description | Short description |
| Required Items | Minimum items to qualify |
| Discount | Fixed Rs. discount (0 for no discount) |
| Free Shipping | Whether bundle includes free shipping |
| Bonus Points | Points earned toward free item |

**Default Bundle Tiers:**
- **Duo Pack** (2 items): Free Shipping + 2 points
- **Trio Pack** (3 items): Rs. 300 OFF + Free Shipping + 3 points
- **Squad Deal** (4+ items): Rs. 500 OFF + Free Shipping + 4 points

### Points to Free Item
Set how many bonus points are needed to redeem a free item (default: 9).

---

## Payment Methods
```typescript
paymentMethods: [
  { 
    id: 'cod', 
    name: 'Cash on Delivery', 
    enabled: true, 
    icon: 'Banknote',
  },
  { 
    id: 'esewa', 
    name: 'eSewa', 
    enabled: true, 
    icon: 'Smartphone',
    instructions: 'Send payment to 9866115154 and upload screenshot',
  },
  { 
    id: 'khalti', 
    name: 'Khalti', 
    enabled: true, 
    icon: 'Smartphone',
    instructions: 'Send payment to 9866115154 and upload screenshot',
  },
  { 
    id: 'bank', 
    name: 'Bank Transfer', 
    enabled: false, // Disable by setting to false
    icon: 'Building',
  },
],
```

---

## International Payment Methods

For stores accepting international payments (Visa, Mastercard, PayPal, Crypto), the config includes pre-defined entries that are **disabled by default**. Enable them by setting `enabled: true` in `site.config.ts`.

### Visa / Mastercard via Stripe

1. Create a [Stripe](https://stripe.com) account and complete verification
2. Create a **Payment Link** or **Checkout Session** at [dashboard.stripe.com/payment-links](https://dashboard.stripe.com/payment-links)
3. Enable the `visa` and/or `mastercard` entries in `site.config.ts`:
   ```typescript
   {
     id: 'visa',
     name: 'Visa',
     enabled: true,
     icon: 'CreditCard',
     processorUrl: 'https://buy.stripe.com/your-link-here',
   },
   ```
4. For full Stripe Checkout integration, use the `stripe` payment method with your Payment Link URL

### PayPal

1. Create a [PayPal Business](https://www.paypal.com/business) account
2. Generate a **PayPal.me** link or set up **PayPal Buttons** at [developer.paypal.com](https://developer.paypal.com)
3. Enable in config:
   ```typescript
   {
     id: 'paypal',
     name: 'PayPal',
     enabled: true,
     icon: 'Globe',
     processorUrl: 'https://paypal.me/YourBusinessName',
   },
   ```

### Crypto Payments (Bitcoin, Ethereum, etc.)

**Option A: Coinbase Commerce**
1. Sign up at [commerce.coinbase.com](https://commerce.coinbase.com)
2. Create a checkout or payment button
3. Set `processorUrl` to your Coinbase Commerce checkout URL

**Option B: BTCPay Server (Self-hosted)**
1. Deploy BTCPay Server via [btcpayserver.org](https://btcpayserver.org)
2. Create a payment request or point-of-sale
3. Set `processorUrl` to your BTCPay checkout URL

```typescript
{
  id: 'crypto',
  name: 'Crypto (BTC/ETH)',
  enabled: true,
  icon: 'Bitcoin',
  processorUrl: 'https://commerce.coinbase.com/checkout/your-id',
},
```

### How `processorUrl` Works

When a payment method has a `processorUrl`, you can redirect customers to that URL at checkout. The template provides the configuration—you implement the redirect logic in your checkout flow based on the selected payment method:

```typescript
const selectedMethod = siteConfig.paymentMethods.find(m => m.id === selectedPaymentId);
if (selectedMethod?.processorUrl) {
  window.open(selectedMethod.processorUrl, '_blank');
}
```

---

## NCM Courier Settings
```typescript
courier: {
  provider: 'ncm',
  ncm: {
    sourceBranch: 'NARAYANGHAT',  // Your registered NCM branch
    apiUrl: 'https://portal.nepalcanmove.com',
    deliveryTypes: ['Branch2Door', 'Branch2Branch'],
    defaultWeight: 0.5,
  },
},
```

**Important**: Also update `supabase/functions/_shared/config.ts` with matching NCM settings.

---

## Step 2: Update Edge Function Config

Update `supabase/functions/_shared/config.ts` to match your settings:

```typescript
export const NCM_CONFIG = {
  sourceBranch: "YOUR_BRANCH_NAME",  // Must match site.config.ts
  apiUrl: "https://portal.nepalcanmove.com",
  validDeliveryTypes: ["Door2Door", "Branch2Door", "Branch2Branch", "Door2Branch"],
  defaultWeight: 0.5,
};

export const DATABASE_CONFIG = {
  orderNumberPrefix: "YSN",  // Must match site.config.ts
  storageBucket: "product-images",
};

export const BUSINESS_CONFIG = {
  name: "Your Store Name",
  email: "hello@yourdomain.com",
  phone: "+1 234 567 8900",
};
```

---

## Step 3: Replace Brand Assets

| File | Description | Recommended Size |
|------|-------------|------------------|
| `public/placeholder-logo.svg` | Main logo | 200x60px (SVG preferred) |
| `public/favicon.ico` | Browser tab icon | 32x32px |
| `public/og-image.jpg` | Social sharing image | 1200x630px |
| `src/assets/hero-banner.jpg` | Hero background image | 1920x1080px |
| `src/assets/video.mp4` | Hero background video | 1920x1080px (optional) |
| Hero carousel slides | Multiple hero images | 1920x1080px each |

---

## Step 4: Connect New Supabase Project

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy:
   - Project URL
   - Anon/Public key
3. Update `.env` with new credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

4. Run all migrations from `supabase/migrations/` in order:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy each migration file and execute in chronological order
   - Or use Supabase CLI: `supabase db push`

---

## Step 5: Deploy Edge Functions

Edge functions are deployed automatically when using Lovable. For manual deployment:

**Option A: Lovable (Automatic)**
- Edge functions deploy automatically when you save changes in Lovable

**Option B: Supabase CLI (Manual)**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy ncm-create-shipment
```

---

## Step 6: Configure Supabase Secrets

Go to **Supabase Dashboard → Settings → Edge Functions → Secrets** and add:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `NCM_API_TOKEN` | Nepal Can Move API token | 1. Go to [portal.nepalcanmove.com](https://portal.nepalcanmove.com) <br> 2. Login to vendor account <br> 3. Go to Settings → API <br> 4. Generate/copy API token |
| `RESEND_API_KEY` | Email sending API key | 1. Go to [resend.com](https://resend.com) <br> 2. Create account <br> 3. Verify your domain at [resend.com/domains](https://resend.com/domains) <br> 4. Create API key at [resend.com/api-keys](https://resend.com/api-keys) |
| `NCM_WEBHOOK_SECRET` | Webhook signature verification | Optional - set a random string for security |

---

## Store Type Configuration

The `storeType` setting automatically configures:

| Store Type | Sizes | Loader Animation | Default Filters |
|------------|-------|------------------|-----------------|
| `clothing` | S, M, L, XL, XXL | Football spinner | League, Era, Kit Type |
| `shoes` | 36, 37, 38... 45 | Shoe icon | Size |
| `jewelry` | 5, 6, 7... 12 (ring sizes) | Diamond spinner | Material, Gemstone |
| `cosmetics` | 30ml, 50ml, 100ml, 200ml | Lipstick icon | Skin Type, Formula |
| `electronics` | Standard | Circuit icon | Category |
| `general` | One Size | Default spinner | Category |

---

## Feature Toggles

Enable/disable features in `site.config.ts`:

```typescript
features: {
  wishlist: true,         // Wishlist functionality
  reviews: true,          // Product reviews
  newsletter: true,       // Newsletter signup
  whatsappButton: true,   // Floating WhatsApp button
  loyaltyPoints: true,    // Loyalty rewards program
  bundleDeals: true,      // Bundle deal suggestions
  recentlyViewed: true,   // Recently viewed products
  socialProof: true,      // "X people viewing" notifications
  ncmShipping: true,      // NCM courier integration
  pos: true,              // Point of Sale for in-store orders
  shopByCategory: true,   // Category grid on homepage
  categoryPage: false,    // Dedicated /categories page
  categoryImages: true,   // Show images in category cards
}
```

---

## Database Tables

### store_settings Table
Admin-configurable settings stored as JSON:
- `loyalty`: Loyalty program configuration
- `bundles`: Bundle deals configuration

### Required Tables
Make sure all migrations are run to create:
- `products`, `product_sizes`
- `categories`
- `orders`, `order_items`
- `addresses`, `profiles`
- `loyalty_rewards`, `reward_codes`
- `store_settings`
- And others...

---

## Deployment Checklist

Before going live:

- [ ] Updated `src/config/site.config.ts` with client info
- [ ] Updated `supabase/functions/_shared/config.ts` with matching settings
- [ ] Replaced all brand assets (logo, favicon, og-image)
- [ ] Added hero carousel images (if using carousel mode)
- [ ] Created new Supabase project
- [ ] Ran all database migrations
- [ ] Updated `.env` credentials
- [ ] Added Supabase secrets (NCM_API_TOKEN, RESEND_API_KEY)
- [ ] Configured auth redirect URLs
- [ ] Updated Google Maps embed URL
- [ ] Tested all contact links (email, phone, WhatsApp)
- [ ] Added products to database
- [ ] Configured loyalty & bundle settings in admin
- [ ] Tested checkout flow with NCM shipping
- [ ] Verified payment methods work correctly
- [ ] Connected custom domain

---

## File Structure Reference

```
src/
├── config/
│   ├── site.config.ts      # ← Main configuration file
│   ├── ThemeInjector.tsx   # ← Injects theme colors as CSS variables
│   └── ThemeProvider.tsx   # ← React context for config access
│
├── hooks/
│   ├── useStoreSettings.ts # ← Fetch loyalty/bundle settings from DB
│   └── ...
│
├── pages/admin/
│   ├── AdminLoyaltySettings.tsx  # ← Admin UI for loyalty/bundles
│   └── ...
│
├── components/layout/
│   ├── VideoHero.tsx       # ← Supports video/image/carousel modes
│   ├── HeroCarousel.tsx    # ← Multi-image carousel component
│   └── ...
│
supabase/
├── functions/
│   ├── _shared/
│   │   └── config.ts       # ← Edge function configuration
│   └── ... (other functions)
```

---

## Support

For questions about customization, refer to:
- [Lovable Documentation](https://docs.lovable.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
