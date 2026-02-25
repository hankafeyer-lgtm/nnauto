# Design Guidelines: Premium Czech Automotive Marketplace

## Design Approach

**Reference-Based Approach** inspired by luxury automotive experiences: aaauto.cz's functionality + Porsche/BMW configurator aesthetics + luxury real estate platforms (Sotheby's) for premium presentation. Focus: sophisticated restraint, trust through clarity, and breathing room.

**Design Principles:**
- Premium through subtlety, not excess
- Generous negative space as a luxury signal
- Refined typography hierarchy
- Depth through layering and shadows
- Trust indicators woven naturally throughout

## Typography System

**Font Families:**
- Primary: Poppins (400, 500, 600) for elegant modernity
- Alternative: DM Sans or Space Grotesk from Google Fonts
- Headings: 500-600 weight with tighter tracking
- Body: 400 weight, increased line-height (1.7) for readability
- Numbers/Specs: 500 weight with tabular-nums

**Type Scale:**
- Hero Titles: text-6xl to text-7xl (tight tracking)
- Page Headers: text-4xl to text-5xl
- Section Titles: text-3xl
- Card Titles: text-xl to text-2xl
- Body Text: text-base to text-lg (generous leading)
- Specs/Meta: text-sm
- Fine Print: text-xs

## Layout System

**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 20, 24
- Generous section spacing: py-20, py-24, py-32
- Component padding: p-8, p-12
- Card gaps: gap-8, gap-12
- Form spacing: space-y-6, space-y-8

**Grid Structure:**
- Desktop listings: 2-column grid (lg:grid-cols-2) for premium card size
- Container: max-w-7xl with px-8 to px-12

## Core Components

### Navigation
**Header:** Floating/glass-morphism effect sticky nav
- Height: h-24
- Logo left, premium spacing between nav items (gap-12)
- "Přidat inzerát" CTA with refined styling
- User menu with avatar
- Subtle shadow-lg with blur

### Homepage

**Hero Section:**
- Height: 85vh with premium automotive photography
- Dark gradient overlay for text contrast
- Centered search widget with backdrop-blur-xl and subtle border
- Refined search inputs with generous padding (h-14, px-6)
- Hero CTA buttons with backdrop-blur-md background (no hover states defined)

**Featured Sections:**
- Premium Listings: 2-column grid with generous gap-12
- Editorial-style "Featured Collections" (Vintage, Electric, Luxury)
- Trust section: stats/testimonials in 4-column layout

### Car Listing Cards
**Structure:**
- Large image area: aspect-ratio-3/2 with subtle rounded-2xl
- Generous internal padding: p-8
- Price: text-3xl, font-semibold, letter-spacing tight
- Title: text-xl with refined spacing
- Specs row: Horizontal with icon + label pairs, gap-6
- Location/date: understated text-sm
- Shadow: shadow-xl with hover:shadow-2xl and subtle scale-105 transition
- Verified badge for premium listings (top-right overlay)

### Search & Filters

**Sidebar Filters:**
- Width: w-80 with refined spacing
- Each filter group: mb-8, elegant dividers
- Range sliders with premium thumb styling
- Checkbox/radio with refined spacing
- Collapsible sections with smooth transitions

**Filter Bar (Top):**
- Horizontal chips with counts
- Refined rounded-full badges
- Clear distinction between active/inactive states

### Listing Detail Page

**Layout:**
- Full-width hero gallery: h-screen with sticky thumbnail navigation
- Below gallery: 2-column layout (60/40 split)
- Left: Specifications, description, history
- Right: Sticky contact panel with seller info

**Image Gallery:**
- Main: Full-viewport with subtle fade overlay
- Thumbnails: Horizontal strip with gap-4, rounded-lg
- Lightbox with elegant transitions

**Specs Panel:**
- Premium card: rounded-2xl, shadow-2xl, p-10
- Price: text-5xl with refined typography
- Primary CTA: Full-width, h-14
- Specs grid: 2-column, generous spacing (gap-y-6)
- Icons from Heroicons with subtle sizing

**Seller Section:**
- Avatar with verified badge
- Rating stars with review count
- Response time indicator
- Professional dealer badge

### User Dashboard

**Sidebar:** 
- w-72, refined navigation items (h-12, px-6)
- Active state with subtle highlight
- Icons with text labels

**Listings Management:**
- Card-based layout instead of table
- Preview thumbnail, stats, actions
- Status badges with refined colors
- Analytics cards: views, inquiries, performance

### Create Listing Form

**Multi-step Progress:**
- Elegant step indicator at top
- 4 steps: Základní info, Technické údaje, Popis & fotografie, Náhled
- Each step in refined card: max-w-3xl, p-12

**Photo Upload:**
- Large drop zone: min-h-64, dashed-border with refined styling
- Preview grid: grid-cols-4, gap-6
- Drag handles for reordering
- Primary photo indicator

### Admin Panel

**Dashboard:**
- Stats cards: 4-column, refined with icons
- Premium charts with subtle gridlines
- User/listing tables with enhanced spacing
- Action buttons with icon + text

### Pricing/Subscription

**Cards:** 
- 3-column: Trial, Standard, Premium
- Featured plan: elevated with ring and shadow-2xl
- Feature lists with checkmarks, generous line-height
- Monthly/annual toggle

## Images

**Hero Section:** Full-width premium automotive photography - luxury dealership showroom with modern architecture, or iconic Czech landmark (Prague) with luxury vehicles. Dark overlay gradient (top to bottom) for text legibility.

**Listing Cards:** Professional car photography - 3/4 front angle, studio lighting or elegant outdoor setting. User-uploaded multi-angle shots.

**Category Headers:** Refined automotive lifestyle imagery - details of luxury interiors, engineering close-ups, scenic driving roads.

**Trust Section:** Czech automotive industry partnerships, verified dealer badges, secure payment icons.

**Empty States:** Minimalist illustrations with Czech automotive themes.

**Background Elements:** Subtle texture overlays, abstract automotive patterns (low opacity).

## Component Patterns

**Cards:** rounded-2xl, shadow-xl, generous padding (p-8 to p-12), subtle border with refined opacity

**Buttons:** 
- h-12 to h-14, px-8 to px-10, rounded-xl
- Letter-spacing refined for elegance
- Subtle shadows and depth

**Badges:** rounded-full, px-4, py-1.5, refined typography

**Input Fields:** h-14, px-6, rounded-xl, subtle shadow-inner, refined focus states

**Dividers:** Subtle, refined opacity, generous spacing (my-12)

## Accessibility

- High contrast ratios maintained despite premium aesthetics
- Focus rings visible and elegant
- ARIA labels in Czech
- Semantic HTML throughout
- Keyboard navigation refined but functional