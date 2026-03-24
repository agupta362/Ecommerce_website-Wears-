/**
 * ============================================================================
 * WHITE-LABEL SITE CONFIGURATION
 * ============================================================================
 *
 * This is the SINGLE file you need to edit to customize the entire store.
 * For a new client, update the values below and replace brand assets.
 *
 * Required Asset Replacements:
 * - Logo: public/placeholder-logo.svg
 * - Favicon: public/favicon.ico
 * - OG Image: public/og-image.jpg
 * - Hero Video/Image: src/assets/video.mp4, src/assets/hero-banner.jpg
 *
 * Required Supabase Secrets:
 * - NCM_API_TOKEN: Nepal Can Move API token from portal.nepalcanmove.com
 * - RESEND_API_KEY: Resend.com API key for transactional emails
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type StoreType = "clothing" | "jewelry" | "cosmetics" | "shoes" | "electronics" | "general";
export type CourierProvider = "ncm" | "custom" | "none";
export type PaymentMethodId =
  | "cod"
  | "esewa"
  | "khalti"
  | "bank"
  | "card"
  | "visa"
  | "mastercard"
  | "paypal"
  | "crypto"
  | "stripe";
export type LoaderType = "football" | "jewelry" | "cosmetics" | "shoes" | "default";

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  enabled: boolean;
  icon: "Banknote" | "Smartphone" | "Building" | "CreditCard" | "Globe" | "Bitcoin";
  instructions?: string;
  /** URL for redirect-based payment processors (Stripe checkout, PayPal, etc.) */
  processorUrl?: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  children?: NavigationItem[];
}

export interface Announcement {
  id: string;
  text: string;
  emoji?: string;
  link?: string;
}

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

export const siteConfig = {
  // ==========================================================================
  // STORE TYPE
  // ==========================================================================
  // Determines size options, loader animation, and default categories
  storeType: "clothing" as StoreType,

  // ==========================================================================
  // BUSINESS IDENTITY
  // ==========================================================================
  name: "Babal Wears",
  tagline: "Nepal's Best Clothing Store",
  description: 
    "Premium streetwear and lifestyle apparel for the modern Nepali. Quality fabrics, unique designs, and a commitment to style and comfort. Shop our exclusive collections and elevate your wardrobe with Babal Wears.",
  domain: "https://babalwears.com",
  storeSlug: "babalwears",

  // ==========================================================================
  // CONTACT INFORMATION
  // ==========================================================================
  contact: {
    email: "babalwears@gmail.com",
    phone: "+977 015923926",
    phoneRaw: "977015923926", // For WhatsApp links (no + or spaces)
    address: {
      street: "Kathmandu",
      city: "Kathmandu",
      country: "Nepal",
      full: "Kathmandu, Nepal",
    },
    businessHours: {
      weekdays: "Sunday - Friday: 10:00 AM - 7:00 PM",
      weekends: "Saturday: 11:00 AM - 5:00 PM",
    },
  },

  // ==========================================================================
  // SOCIAL MEDIA
  // ==========================================================================
  social: {
    instagram: "https://www.instagram.com/babalwears/",
    instagramHandle: "@babalwears",
    facebook: "https://facebook.com/babalwears",
    whatsapp: "https://wa.me/977015923926",
    tiktok: "",
  },

  // ==========================================================================
  // THEME & DESIGN
  // ==========================================================================
  // Colors use HSL format: { h: hue (0-360), s: saturation (0-100), l: lightness (0-100) }
  // These colors are injected as CSS variables at runtime by ThemeInjector
theme: {
  colors: {
    light: {
      background: { h: 0, s: 0, l: 100 },         // white background
      foreground: { h: 0, s: 0, l: 0 },           // black text

      card: { h: 0, s: 0, l: 100 },               // white card
      cardForeground: { h: 0, s: 0, l: 0 },       // black text inside card

      primary: { h: 0, s: 0, l: 0 },              // black buttons
      primaryForeground: { h: 0, s: 0, l: 100 },  // white text on buttons

      secondary: { h: 0, s: 0, l: 85 },           // light grey secondary elements
      secondaryForeground: { h: 0, s: 0, l: 0 },

      muted: { h: 0, s: 0, l: 93 },               // very light grey backgrounds
      mutedForeground: { h: 0, s: 0, l: 40 },    // medium dark text

      accent: { h: 0, s: 0, l: 0 },               // black accent for links, highlights
      accentForeground: { h: 0, s: 0, l: 100 },  // white text on accent if needed

      success: { h: 0, s: 0, l: 20 },             // dark grey for success messages
      successForeground: { h: 0, s: 0, l: 100 },

      destructive: { h: 0, s: 0, l: 30 },         // dark grey for warnings/errors
      destructiveForeground: { h: 0, s: 0, l: 100 },

      border: { h: 0, s: 0, l: 80 },              // light grey borders
      input: { h: 0, s: 0, l: 90 },               // white-ish input backgrounds
      ring: { h: 0, s: 0, l: 20 },                // dark grey focus ring
    },
    dark: {
      background: { h: 0, s: 0, l: 0 },           // black background
      foreground: { h: 0, s: 0, l: 100 },         // white text

      card: { h: 0, s: 0, l: 5 },                 // dark grey card
      cardForeground: { h: 0, s: 0, l: 100 },    // white text inside card

      primary: { h: 0, s: 0, l: 100 },            // white button in dark mode
      primaryForeground: { h: 0, s: 0, l: 0 },    // black text on button

      secondary: { h: 0, s: 0, l: 25 },
      secondaryForeground: { h: 0, s: 0, l: 100 },

      muted: { h: 0, s: 0, l: 15 },
      mutedForeground: { h: 0, s: 0, l: 65 },

      accent: { h: 0, s: 0, l: 100 },             // white accent in dark mode
      accentForeground: { h: 0, s: 0, l: 0 },

      success: { h: 0, s: 0, l: 70 },
      successForeground: { h: 0, s: 0, l: 5 },

      destructive: { h: 0, s: 0, l: 70 },
      destructiveForeground: { h: 0, s: 0, l: 5 },

      border: { h: 0, s: 0, l: 25 },
      input: { h: 0, s: 0, l: 25 },
      ring: { h: 0, s: 0, l: 100 },              // white focus ring
    },
  },
    fonts: {
      display: "'Oswald', sans-serif",
      body: "'Space Mono', monospace",
    },
    borderRadius: "0",
  },

  // ==========================================================================
  // PAYMENT METHODS
  // ==========================================================================
  paymentMethods: [
    {
      id: "cod" as PaymentMethodId,
      name: "Cash on Delivery",
      enabled: true,
      icon: "Banknote" as const,
    },
    {
      id: "esewa" as PaymentMethodId,
      name: "eSewa",
      enabled: true,
      icon: "Smartphone" as const,
      instructions: "Send payment to 9866115154 and upload screenshot",
    },
    {
      id: "khalti" as PaymentMethodId,
      name: "Khalti",
      enabled: true,
      icon: "Smartphone" as const,
      instructions: "Send payment to 9866115154 and upload screenshot",
    },
    {
      id: "bank" as PaymentMethodId,
      name: "Bank Transfer",
      enabled: true,
      icon: "Building" as const,
      instructions: "Account details will be provided at checkout",
    },
    // ── International Payment Methods (disabled by default) ──
    // Enable these for stores accepting international payments.
    // See CUSTOMIZATION.md > "International Payment Methods" for setup guide.
    {
      id: "visa" as PaymentMethodId,
      name: "Visa",
      enabled: false,
      icon: "CreditCard" as const,
      instructions: "Pay securely with your Visa card via Stripe",
      processorUrl: "", // Set your Stripe checkout URL
    },
    {
      id: "mastercard" as PaymentMethodId,
      name: "Mastercard",
      enabled: false,
      icon: "CreditCard" as const,
      instructions: "Pay securely with your Mastercard via Stripe",
      processorUrl: "",
    },
    {
      id: "paypal" as PaymentMethodId,
      name: "PayPal",
      enabled: false,
      icon: "Globe" as const,
      instructions: "Pay with your PayPal account",
      processorUrl: "", // Set your PayPal.me or checkout URL
    },
    {
      id: "stripe" as PaymentMethodId,
      name: "Stripe Checkout",
      enabled: false,
      icon: "CreditCard" as const,
      instructions: "Secure payment via Stripe",
      processorUrl: "", // Set your Stripe Payment Link
    },
    {
      id: "crypto" as PaymentMethodId,
      name: "Crypto (BTC/ETH)",
      enabled: false,
      icon: "Bitcoin" as const,
      instructions: "Pay with Bitcoin, Ethereum, or other cryptocurrencies",
      processorUrl: "", // Set your Coinbase Commerce or BTCPay URL
    },
  ] as PaymentMethod[],

  // ==========================================================================
  // COURIER & SHIPPING (NCM)
  // ==========================================================================
  courier: {
    provider: "ncm" as CourierProvider,
    ncm: {
      // Your registered source branch in NCM dashboard
      // This is where all shipments originate from
      sourceBranch: "KATHMANDU",
      apiUrl: "https://portal.nepalcanmove.com",
      // Supported delivery types
      deliveryTypes: ["Branch2Door", "Branch2Branch"] as const,
      // Default package weight in kg
      defaultWeight: 0.5,
      // Delivery type labels for UI
      deliveryTypeLabels: {
        Branch2Door: "Home Delivery",
        Branch2Branch: "Office Pickup",
      },
    },
  },

  // ==========================================================================
  // SHIPPING SETTINGS
  // ==========================================================================
  shipping: {
    freeShippingThreshold: 2, // Free shipping on 2+ items
    freeShippingMessage: "Free Delivery on 2 or more ordered.",
    defaultCost: 150,
    deliveryEstimate: "2-4 business days",
    codAvailable: true,
  },

  // ==========================================================================
  // SEO & META TAGS
  // ==========================================================================
  seo: {
    title: "Babal Wears | Streetwear & Clothing Brand in Nepal",
description:
  "Shop premium streetwear and clothing from Babal Wears. Stylish t-shirts, hoodies, and everyday wear delivered across Nepal.",
    keywords: ["babal wears", "t-shirs nepal", "clothing nepal", "shirts in nepal", "classic t-shirts", "printed t-shirts", "streetwear nepal", "lifestyle apparel", "quality fabrics", "unique designs"],
    ogImage: "/og-image.jpg",
    twitterHandle: "@babalwears",
  },

  // ==========================================================================
  // PRODUCT CONFIGURATION
  // ==========================================================================
  products: {
    currency: "NPR",
    currencySymbol: "Rs.",
    currencyLocale: "en-NP",

    // Size options based on store type
    // Access via: siteConfig.products.sizeOptions[siteConfig.storeType]
    sizeOptions: {
      clothing: ["S", "M", "L", "XL", "XXL"],
      shoes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      jewelry: ["5", "6", "7", "8", "9", "10", "11", "12"],
      cosmetics: ["30ml", "50ml", "100ml", "200ml"],
      electronics: ["Standard"],
      general: ["One Size"],
    },

    // Default size (used for clothing store type)
    defaultSize: "L",

    // Active sizes for current store type
    get sizes() {
      return siteConfig.products.sizeOptions[siteConfig.storeType] || ["One Size"];
    },

    // ==========================================================================
    // VARIANT CONFIGURATION (White-Label)
    // ==========================================================================
    // Define which variant attributes are available per store type.
    // Each variant has: key (DB column), label (UI display), type ('swatch' for colors, 'button' for text)
    variants: {
      clothing: [
        { key: 'color', label: 'Color', type: 'swatch' as const },
      ],
      jewelry: [
        { key: 'metal', label: 'Metal', type: 'button' as const },
      ],
      cosmetics: [
        { key: 'shade', label: 'Shade', type: 'swatch' as const },
      ],
      shoes: [
        { key: 'color', label: 'Color', type: 'swatch' as const },
      ],
      electronics: [] as { key: string; label: string; type: 'swatch' | 'button' }[],
      general: [] as { key: string; label: string; type: 'swatch' | 'button' }[],
    },
  },

  // ==========================================================================
  // SEARCH CONFIGURATION
  // ==========================================================================
  search: {
    // Popular search terms shown when search is empty (configurable per clone)
    popularTerms: ["Shirts", "Streetwear Nepal", "Babal Wears", "Lifestyle Apparel", "Quality Fabrics", "Unique Designs"],
    // Placeholder text in search input
    placeholder: "Search for products, categories, brands...",
  },

  // ==========================================================================
  // DATABASE CONFIGURATION
  // ==========================================================================
  database: {
    // Prefix for order numbers (e.g., RKN-20260130-1234)
    orderNumberPrefix: "BBW",
    // Supabase storage bucket for product images
    storageBucket: "product-images",
  },

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================
  navigation: [
  {
    name: "Shop",
    href: "/shop",
    children: [
      { name: "T-Shirts", href: "/shop?category=t-shirts" },
      { name: "Oversized Tees", href: "/shop?category=oversized-tees" },
      { name: "Hoodies", href: "/shop?category=hoodies" },
      { name: "Caps", href: "/shop?category=caps" },
      { name: "New Arrivals", href: "/shop?filter=new" },
      {name: "Jackets", href: "/shop?category=jackets"},
      { name: "Shop All", href: "/shop" },
    ],
  },
  
  { name: "New Arrivals", href: "/shop?filter=new" },
  { name: "Sale", href: "/shop?filter=sale" },
  { name: "Contact", href: "/contact" },
] as NavigationItem[],

  // ==========================================================================
  // ANNOUNCEMENTS (Rotating banner at top)
  // ==========================================================================
  announcements: [
  { id: "1", text: "Free Delivery on Orders Above Rs. 3000", emoji: "🚚" },
  { id: "2", text: "Cash on Delivery Available Across Nepal", emoji: "💵" },
  { id: "3", text: "New Babal Wears Collection Just Dropped!", emoji: "🔥", link: "/shop?filter=new" },
  { id: "4", text: "Limited Time Sale on Selected Items", emoji: "🎉", link: "/shop?filter=sale" },
  ] as Announcement[],

  // ==========================================================================
  // ANNOUNCEMENT BAR (Scrolling marquee ticker)
  // ==========================================================================
  announcementBar: {
   marqueeText: "BABAL WEARS +++ PREMIUM STREETWEAR +++ FREE DELIVERY ABOVE RS.3000 +++ CASH ON DELIVERY AVAILABLE +++ NEW DROPS EVERY WEEK +++",
  },

  // ==========================================================================
  // HERO SECTION
  // ==========================================================================
  hero: {
    // Hero display mode: 'video' | 'image' | 'carousel'
    type: "video" as "video" | "image" | "carousel",

    // For carousel mode - add slide images here
    slides: [
      { id: "1", image: "/hero-slide-1.jpg" },
      { id: "2", image: "/hero-slide-2.jpg" },
      { id: "3", image: "/hero-slide-3.jpg" },
    ],
    autoPlayInterval: 5000, // ms between slides
    showArrows: true,
    showDots: true,
    pauseOnHover: true,

    // Content (used for all modes)
    subtitle: "Babal Wears",
    titleLine1: "Style That",
    titleLine2: "Speaks",
    description:
      "Premium streetwear and everyday clothing designed for comfort, style, and confidence.",
    primaryCta: { text: "Shop Collection", link: "/shop" },
    secondaryCta: { text: "New Arrivals", link: "/shop?filter=new" },
  },

  // ==========================================================================
  // NEWSLETTER
  // ==========================================================================
  newsletter: {
    title: "Join the Squad",
    description: "Subscribe for exclusive drops, deals, and style tips. Be the first to know about new arrivals and legendary sales.",
  },

  // ==========================================================================
  // FEATURE TOGGLES
  // ==========================================================================
  features: {
    wishlist: true,
    reviews: true,
    newsletter: true,
    whatsappButton: true,
    loyaltyPoints: true,
    bundleDeals: true,
    recentlyViewed: true,
    socialProof: true,
    // NCM courier integration
    ncmShipping: true,
    // Point of Sale for in-store orders
    pos: true,
    // Shop by category feature
    shopByCategory: true,
    categoryPage: false, // Dedicated /categories page
    categoryImages: true,
  },

  // ==========================================================================
  // SHOP PAGE FILTERS
  // ==========================================================================
  shop: {
    // Which filters to show (toggle per store type)
  filters: {
    priceRange: true,
    category: true,
    size: true,
    fits:true,
    collections:true,
    materials: false,
    gemstone: false,
    skinType: false,
  },

    // Filter options by store type
    filterOptions: {
      clothing: {
        collections: ["Babal Essentials","Oversized Drop","Street Classics","Limited Drop","summer25"],
        category: ["T-Shirts", "Hoodies", "Caps", "Oversized Tees", "Jackets",],
        fits: ["Regular", "Oversized"],
      },
      jewelry: {
        materials: ["Gold", "Silver", "Platinum", "Rose Gold"],
        gemstones: ["Diamond", "Ruby", "Sapphire", "Emerald", "Pearl"],
        styles: ["Classic", "Modern", "Vintage", "Minimalist"],
      },
      cosmetics: {
        skinTypes: ["Oily", "Dry", "Combination", "Sensitive", "Normal"],
        concerns: ["Anti-aging", "Acne", "Hydration", "Brightening"],
        formulas: ["Cream", "Serum", "Gel", "Oil", "Powder"],
      },
    },

    // Category display configuration
    categoryDisplay: {
      style: "grid" as "grid" | "list" | "carousel",
      showProductCount: true,
      showDescription: false,
      columnsDesktop: 6,
      columnsMobile: 2,
    },

    // Sorting options
    sortOptions: [
      { value: "featured", label: "Featured" },
      { value: "newest", label: "Newest" },
      { value: "price-asc", label: "Price: Low to High" },
      { value: "price-desc", label: "Price: High to Low" },
      { value: "rating", label: "Top Rated" },
    ],
  },

  // ==========================================================================
  // INVOICE CONFIGURATION
  // ==========================================================================
  invoice: {
    // Store code prefix for invoice numbers (e.g., RKN-000001)
    storeCode: "BBW",
    // Show tax line on invoice
    taxEnabled: false,
    // VAT percentage (0-100)
    taxRate: 0,
    // Tax line label
    taxLabel: "VAT",
    // Footer message on invoices
    footer: "Thank you for shopping with Babal Wears!",
    // Terms and conditions (optional, leave empty to hide)
    termsAndConditions: "",
    // Auto-generate invoice when order reaches these statuses
    autoGenerateOnStatus: ["delivered", "confirmed"] as const,
    // Thermal printer width in mm (58 or 80)
    thermalPrinterWidth: 80,
  },

  // ==========================================================================
  // POINT OF SALE CONFIGURATION
  // ==========================================================================
  pos: {
    // Show POS in admin dashboard
    enabled: true,
    // Default payment method for walk-in sales
    defaultPaymentMethod: "cash" as "cash" | "qr",
    // Auto-open print dialog after completing sale
    printOnComplete: true,
    // Require customer phone for walk-in orders
    requireCustomerPhone: false,
    // Store location for in-store orders (used as shipping address)
    storeLocation: {
      fullName: "Babal Wears",
      phone: "015923926",
      city: "Kathmandu",
      district: "Kathmamdu",
      addressLine1: "Kathmandu, Chitwan",
    },
  },

  // ==========================================================================
  // PAGE LOADER CONFIGURATION
  // ==========================================================================
  loader: {
    type: "football" as LoaderType,
    tagline: "ood style takes a second… hang tight!",
    showOnce: true,
  },

  // ==========================================================================
  // GOOGLE MAPS EMBED
  // ==========================================================================
  mapEmbed:
    "https://www.google.com/maps?q=Kathmandu+Nepal&output=embed",

  // ==========================================================================
  // WHATSAPP MESSAGE TEMPLATES
  // ==========================================================================
  whatsapp: {
    defaultMessage: "Hi! I'm interested in Babal Wears products.",
    orderInquiry: "Hi! I'd like to inquire about my order.",
    productInquiry: (productName: string) => `Hi! I'm interested in the ${productName}.`,
  },

  // ==========================================================================
  // HOMEPAGE CONTENT
  // ==========================================================================
  homepage: {
    saleBanner: {
    label: "Limited Time Offer",
    title: "Babal Wears Sale",
    subtitle: "Up to 25% off on selected streetwear items.",
    cta: { text: "Shop Sale", link: "/shop?filter=sale" },
    },
    
    whyChooseUs: {
      subtitle: "We're passionate about fashion and bringing you the best streetwear in Nepal. Here's why the squad trusts us.",
      features: [
        { emoji: "✨", title: "Premium Quality", description: "High quality fabrics and durable prints designed for everyday wear." },
        { emoji: "🇳🇵", title: "Nationwide Delivery", description: "We deliver across Nepal with fast and reliable shipping.", dark: true },
        { emoji: "💳", title: "Easy Payments", description: "Cash on Delivery, eSewa, Khalti, or bank transfer." },
        { emoji: "🔄", title: "Hassle-Free Returns", description: "7-day return policy for a worry-free shopping experience." },],
      },
    featuresBar: [
      { icon: "Truck", title: "Free Delivery", description: "Free shipping across Kathmandu Valley or when ordered 2+ items from somewhere else" },
      { icon: "CreditCard", title: "Cash on Delivery", description: "Pay when you receive" },
    
      { icon: "Shield", title: "Premium Quality", description: "High quality fabrics" },
      { icon: "RefreshCw", title: "Easy Returns", description: "7-day return policy" },
    ],
    communitySubtitle: "Join our community of fashion experts",
  },

  // ==========================================================================
  // TRUST BADGES
  // ==========================================================================
  trustBadges: [
    { icon: "Shield", title: "100% Authentic", description: "Genuine products only" },
    { icon: "Truck", title: "Fast Delivery", description: "Across Nepal" },
    { icon: "RefreshCw", title: "Easy Returns", description: "7-day return policy" },
    { icon: "Award", title: "Quality Guaranteed", description: "Premium materials" },
  ],

  // ==========================================================================
  // FAQ CONTENT
  // ==========================================================================
  faq: [
    {
      category: "Orders & Shipping",
      questions: [
        { q: "How long does delivery take?", a: "Within Kathmandu Valley: 1-2 business days. Outside Valley: 3-5 business days. We process orders within 24 hours of confirmation." },
        { q: "Is Cash on Delivery available?", a: "Yes! Cash on Delivery is our most popular payment method and is available across Nepal. You can pay in cash when you receive your order." },
        { q: "Do you offer free shipping?", a: "Yes, we offer free shipping within Kathmandu Valley for orders above Rs. 3,000. For other areas, a flat shipping fee of Rs. 200 applies." },
        { q: "Can I track my order?", a: "Yes! Once your order is shipped, we will WhatsApp you the tracking details. You can also contact us anytime for order updates." },
      ],
    },
    {
      category: "Products & Sizing",
      questions: [

        { q: "How do I choose the right size?", a: "Our jerseys have a classic, looser fit. If you prefer a tighter fit, consider sizing down. Check our size guide for measurements or contact us on WhatsApp for personalized recommendations." },
        { q: "Are the jerseys authentic?", a: "We sell high-quality replicas that are officially licensed and made with attention to detail. While they are not the exact same as the ones worn by players, they are designed to look and feel authentic." },
        { q: "What material are the jerseys made of?", a: "Our jerseys are made from premium polyester fabric that is lightweight, breathable, and comfortable for everyday wear." }, 
        { q: "Can I wash the jersey in a machine?", a: "Yes, our jerseys are machine washable. We recommend washing them inside out on a gentle cycle with cold water to preserve the colors and prints." },  
        { q: "Do you restock sold-out items?", a: "We do our best to restock popular items. If a product is sold out, you can join the waitlist on the product page to get notified when it's back in stock." },

      ],
    },
    {
      category: "Payments",
      questions: [
        { q: "What payment methods do you accept?", a: "We accept Cash on Delivery (most popular), eSewa, Khalti, and Bank Transfer. For digital payments, send to our number and WhatsApp the screenshot for confirmation." },
        { q: "Is online payment safe?", a: "Yes, we use trusted Nepal payment platforms like eSewa and Khalti. We never store your financial information." },
        { q: "When am I charged for my order?", a: "For COD orders, you pay when you receive the package. For digital payments, you pay at checkout and we confirm receipt before shipping." },
      ],
    },
    {
      category: "Returns & Refunds",
      questions: [
        { q: "What is your return policy?", a: "We offer a 7-day return policy. Items must be unworn, unwashed, and with original tags. Contact us within 7 days of delivery to initiate a return." },
        { q: "Can I exchange for a different size?", a: "Yes! Size exchanges are free within Kathmandu Valley. Just contact us and we will arrange the exchange. Make sure the item is in original condition." },
        { q: "How long do refunds take?", a: "Once we receive and inspect the returned item, refunds are processed within 3-5 business days to your original payment method." },
      ],
    },
    {
      category: "Care Instructions",
      questions: [
        { q: "How should I wash my clothing?", a: "Machine wash cold, inside out, on gentle cycle. Do not use bleach. Hang dry or tumble dry low. Do not iron directly on prints or badges." },
        { q: "How do I store my clothing?", a: "Store flat or on a padded hanger. Avoid folding for long periods to prevent creases on prints. Keep away from direct sunlight." },
      ],
    },
  ],

  // ==========================================================================
  // LEGAL PAGES
  // ==========================================================================
  legal: {
    terms: {
      intro: "By using our store, you agree to these terms.",
      sections: [
        { heading: "Products", content: "We sell high-quality clothing products. Product images are representative; slight variations may occur." },
        { heading: "Orders", content: "Orders are confirmed via WhatsApp/call. We reserve the right to cancel orders due to stock issues with full refund." },
        { heading: "Pricing", content: "All prices are in Nepali Rupees (NPR) and subject to change without notice." },
        { heading: "Liability", content: "We are not liable for delays caused by courier services or circumstances beyond our control." },
      ],
    },
    returnPolicy: {
      sections: [
        { heading: "Exchange policy", content: "Not satisfied? Exchange within 7 days of delivery." },
        { heading: "Conditions", content: "<ul><li>Item must be unworn and unwashed</li><li>Original tags must be attached</li><li>Item must be in original packaging</li></ul>" },
        { heading: "Size Exchanges", content: "Wrong size? We offer size exchanges within Kathmandu Valley. Contact us via WhatsApp to arrange." },
        { heading: "Exchange Process", content: "Once we receive and inspect the item, exchanges are processed within 3-5 business days." },
        { heading: "How to Exchange", content: "Contact us on WhatsApp to initiate a return." },
      ],
    },
    shippingPolicy: {
      sections: [
        { heading: "Delivery Times", content: "<ul><li><strong>Kathmandu Valley:</strong> 1-2 business days</li><li><strong>Outside Valley:</strong> 3-5 business days</li></ul>" },
        { heading: "Shipping Costs", content: "<ul><li><strong>Kathmandu Valley:</strong> FREE for orders above Rs. 3,000 (Rs. 100 below)</li><li><strong>Outside Valley:</strong> Rs. 200 flat rate</li></ul>" },
        { heading: "Cash on Delivery", content: "COD is available across Nepal. Pay in cash when you receive your order." },
        { heading: "Order Tracking", content: "Once shipped, we'll WhatsApp you tracking details. Contact us anytime for updates." },
      ],
    },
  },

  // ==========================================================================
  // SIZE GUIDE
  // ==========================================================================
  sizeGuide: {
    sizingTips: [
      "Our jerseys have a classic, looser fit. If you prefer a tighter fit, consider sizing down.",
      "Check the measurements below to find your perfect fit.",
      "For personalized recommendations, contact us on WhatsApp with your height and weight.",
    ],
  },

  // ==========================================================================
  // FOOTER CONTENT
  // ==========================================================================
  footer: {
    about:
      "Babal Wears is Nepal's premier streetwear brand, offering premium streetwear and lifestyle apparel. We are passionate about bringing you the best in style, comfort, and authenticity. Our mission is to provide football fans across Nepal with premium products that celebrate the beautiful game. With nationwide delivery and a commitment to customer satisfaction, we are your go-to destination for all things football fashion.",
    quickLinks: [
      { name: "Shop All", href: "/shop" },
      { name: "New Arrivals", href: "/shop?filter=new" },
      { name: "Sale", href: "/shop?filter=sale" },
      { name: "Size Guide", href: "/size-guide" },
      { name: "Bulk Orders", href: "/contact" },
    ],
    customerService: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQ", href: "/faq" },
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Returns & Refunds", href: "/return-policy" },
      { name: "Track Order", href: "/track-order" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Authenticity Guarantee", href: "/authenticity" },
    ],
  },

  // ==========================================================================
  // SECRETS CHECKLIST (Documentation only)
  // ==========================================================================
  // These secrets must be configured in Supabase Edge Functions settings
  requiredSecrets: [
    {
      name: "NCM_API_TOKEN",
      description: "Nepal Can Move API token from portal.nepalcanmove.com",
      required: true,
    },
    {
      name: "RESEND_API_KEY",
      description: "Resend.com API key for transactional emails",
      required: false,
    },
  ],
};

export type SiteConfig = typeof siteConfig;