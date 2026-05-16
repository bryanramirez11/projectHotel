---
name: Boutique Management System
colors:
  surface: '#f6faf8'
  surface-dim: '#d6dbd9'
  surface-bright: '#f6faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f3'
  surface-container: '#eaefed'
  surface-container-high: '#e4e9e7'
  surface-container-highest: '#dfe3e2'
  on-surface: '#171d1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2c3130'
  inverse-on-surface: '#edf2f0'
  outline: '#6d7a77'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#006a63'
  on-primary: '#ffffff'
  primary-container: '#4db6ac'
  on-primary-container: '#00433f'
  inverse-primary: '#71d7cd'
  secondary: '#4e6073'
  on-secondary: '#ffffff'
  secondary-container: '#cfe2f9'
  on-secondary-container: '#526478'
  tertiary: '#645e49'
  on-tertiary: '#ffffff'
  tertiary-container: '#ada68e'
  on-tertiary-container: '#403c29'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8ef4e9'
  primary-fixed-dim: '#71d7cd'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#d1e4fb'
  secondary-fixed-dim: '#b5c8df'
  on-secondary-fixed: '#091d2e'
  on-secondary-fixed-variant: '#36485b'
  tertiary-fixed: '#ebe2c8'
  tertiary-fixed-dim: '#cec6ad'
  on-tertiary-fixed: '#1f1c0b'
  on-tertiary-fixed-variant: '#4c4733'
  background: '#f6faf8'
  on-background: '#171d1c'
  surface-variant: '#dfe3e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-table:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 260px
  max-content-width: 1440px
---

## Brand & Style

The design system is anchored in a philosophy of **Elevated Hospitality**. It balances the clinical precision required for property management with the warmth of a high-end boutique concierge. The target audience—hotel owners and front-desk staff—requires a workspace that reduces cognitive load while feeling premium and inviting.

The visual style is a **Minimalist Flat** approach, enhanced by soft depth through ambient shadows rather than heavy gradients. It prioritizes clarity and "breathing room," utilizing generous whitespace to ensure that even data-dense screens feel approachable. The personality is professional yet serene, mirroring the experience of a luxury stay.

## Colors

The palette is designed to evoke trust and tranquility. 

- **Primary (Soft Turquoise):** Used for primary actions, active navigation states, and brand highlights. It provides a fresh, modern energy.
- **Secondary (Trustworthy Blue):** Reserved for core navigation, headings, and moments requiring authority and stability.
- **Accent (Warm Sand):** Used for subtle background tints, secondary badges, and decorative elements to soften the interface.
- **Semantic Colors:** Critical for the room status grid. These are high-saturation to ensure immediate recognition: Green for Available, Red for Occupied, and Yellow for Cleaning.
- **Backgrounds:** A crisp Off-White is used for the application canvas to differentiate from the pure white Surface cards, creating a layered effect without relying on heavy borders.

## Typography

The design system utilizes **Plus Jakarta Sans** for its welcoming, modern, and slightly geometric characteristics. It strikes a perfect balance between friendly approachability and the clean lines of professional SaaS.

- **Headlines:** Use a tighter letter-spacing and heavier weights to establish a clear hierarchy.
- **Body Text:** Optimized for readability with a standard 1.5x line height.
- **Labels:** Small caps are used sparingly for metadata and table headers to provide a distinct visual rhythm without overwhelming the user.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area occupies the remaining space up to a maximum width of 1440px to prevent excessive line lengths on ultra-wide monitors.

An 8px spacing system governs all margins and paddings. 
- **Desktop:** 24px margins between cards and 32px page headers.
- **Tablet:** 16px margins; sidebar collapses into a rail or becomes an overlay.
- **Mobile:** 12px margins; navigation moves to a bottom bar or a full-screen menu.

## Elevation & Depth

To maintain a minimalist aesthetic, depth is created through **Ambient Shadows** and tonal layering. 

- **Level 0 (Background):** Off-white (#F9FAFB), the lowest layer.
- **Level 1 (Cards/Containers):** White (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)).
- **Level 2 (Dropdowns/Modals):** White with a more pronounced shadow (0px 10px 30px rgba(0, 0, 0, 0.10)) to indicate interaction priority.
- **Hover States:** Instead of becoming darker, elements may lift slightly (shadow increases) or use a subtle 5% opacity tint of the Primary color.

## Shapes

The shape language is defined by **large, friendly radii**. This "Rounded" setting applies to all primary interface containers.

- **Buttons & Small Components:** 0.5rem (8px) radius.
- **Cards & Data Tables:** 1rem (16px) radius for the outer container.
- **Modals & Large Containers:** 1.5rem (24px) radius.

This consistency in rounded corners removes visual "sharpness," making the application feel safe and easy to navigate.

## Components

### Sidebar Navigation
The sidebar uses a dark Secondary Blue background or a clean white with high-contrast text. Icons are **2px thin-line strokes**, ensuring they remain professional and don't visually clutter the menu. Active states use the Soft Turquoise as a vertical "pill" indicator.

### Analytics Cards
Cards feature a White surface but use **Soft Tints** of the Primary or Accent color for background icons or trend sparklines (e.g., 10% opacity Turquoise).

### Room Status Grid
A grid of uniform cards representing rooms. The top or side border uses a 4px semantic color bar. The card body displays the room number in a bold weight and the status label in a light-tinted badge.

### Data Tables
Tables focus on high contrast. Header rows use a light gray background with uppercase labels. Row dividers are very faint (1px, #EEEEEE). Cell text is dark and high-contrast to ensure legibility of guest names and booking dates.

### Form Fields
Fields use a 1px border with an 8px radius. In the active state, the border transitions to Soft Turquoise with a subtle 2px glow of the same color. Labels are always positioned above the field, never as placeholders, to maintain accessibility.

### Primary Buttons
Solid Soft Turquoise with white text. Hover states use a slightly deeper tint. The large border radius (8px) is strictly maintained to match the "Rounded" shape language.