# AyurSutra Frontend Component Structure

## Overview

This document outlines the modular component structure for the AyurSutra frontend application, designed for reusability and maintainability.

## Component Architecture

### Layout Components (`/src/components/layout/`)

#### `PageLayout.tsx`

- **Purpose**: Main layout wrapper for all pages
- **Props**:
  - `children`: React.ReactNode
  - `showChatbot?: boolean` (default: true)
- **Features**:
  - Includes Navbar, Footer, and optional Chatbot
  - Consistent layout across all pages

#### `Navbar.tsx`

- **Purpose**: Navigation bar with responsive mobile menu
- **Features**:
  - Fixed positioning with scroll-based background blur
  - Mobile hamburger menu
  - Smooth animations with Framer Motion
  - Brand logo and navigation links

#### `Footer.tsx`

- **Purpose**: Site footer with links and contact information
- **Features**:
  - Social media links with hover animations
  - Contact information
  - Company and product links

### Section Components (`/src/components/sections/`)

#### `HeroSection.tsx`

- **Purpose**: Main hero section with call-to-action
- **Features**:
  - Parallax scrolling effects
  - Animated background elements
  - Gradient text and buttons
  - 3D hover effects

#### `FeaturesSection.tsx`

- **Purpose**: Features showcase with cards
- **Features**:
  - 3D card animations
  - Icon rotation effects
  - Staggered animations
  - Responsive grid layout

#### `TestimonialsSection.tsx`

- **Purpose**: Customer testimonials display
- **Features**:
  - Star ratings
  - Card hover effects
  - Responsive grid

#### `BenefitsSection.tsx`

- **Purpose**: Benefits and value propositions
- **Features**:
  - Icon animations
  - 3D hover effects
  - Clean typography

#### `CTASection.tsx`

- **Purpose**: Call-to-action section
- **Features**:
  - Gradient background
  - Animated elements
  - Action buttons with 3D effects

## Page Structure

### Available Pages

- `/` - Home page (uses all sections)
- `/about` - About page (Hero + Benefits + CTA)
- `/features` - Features page (Features + Testimonials + CTA)
- `/pricing` - Pricing page (CTA only)
- `/contact` - Contact page (CTA only)
- `/dashboard` - Dashboard (custom layout, no chatbot)

### Page Examples

#### Home Page

```tsx
import PageLayout from "@/components/layout/PageLayout";
import HeroSection from "@/components/sections/HeroSection";
// ... other imports

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <BenefitsSection />
      <CTASection />
    </PageLayout>
  );
}
```

#### Custom Page (without chatbot)

```tsx
import PageLayout from "@/components/layout/PageLayout";

export default function Dashboard() {
  return (
    <PageLayout showChatbot={false}>{/* Your custom content */}</PageLayout>
  );
}
```

## Styling and Animations

### CSS Classes

- `perspective-1000`: 3D perspective for transforms
- `perspective-2000`: Enhanced 3D perspective
- `transform-gpu`: GPU acceleration
- `animate-float`: Floating animation
- `gradient-text`: Gradient text effect
- `glass-effect`: Glass morphism effect
- `hover-lift`: Lift effect on hover

### Animation Features

- **Framer Motion**: All animations use Framer Motion
- **Scroll-based animations**: `useScroll` and `useTransform`
- **3D transforms**: Perspective and rotation effects
- **Staggered animations**: Sequential element animations
- **Hover effects**: Interactive element animations

## Usage Guidelines

### Creating New Pages

1. Import `PageLayout` from components
2. Choose appropriate section components
3. Wrap content in `PageLayout`
4. Add `pt-16` class for proper spacing below navbar

### Creating New Sections

1. Create component in `/src/components/sections/`
2. Use Framer Motion for animations
3. Follow existing naming conventions
4. Export from `/src/components/index.ts`

### Customizing Layout

- Modify `PageLayout` for global changes
- Update `Navbar` for navigation changes
- Adjust `Footer` for footer modifications

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── PageLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── sections/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── BenefitsSection.tsx
│   │   └── CTASection.tsx
│   └── index.ts
├── app/
│   ├── page.tsx
│   ├── about/
│   ├── features/
│   ├── pricing/
│   ├── contact/
│   └── dashboard/
└── globals.css
```

## Benefits of This Structure

1. **Reusability**: Components can be used across multiple pages
2. **Maintainability**: Easy to update and modify individual components
3. **Consistency**: Uniform design and behavior across pages
4. **Scalability**: Easy to add new pages and sections
5. **Performance**: Optimized animations and lazy loading
6. **Developer Experience**: Clear separation of concerns and easy imports

