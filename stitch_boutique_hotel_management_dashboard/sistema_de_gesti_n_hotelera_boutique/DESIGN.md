---
name: Sistema de Gestión Hotelera Boutique
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6d7a77'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#006a63'
  on-primary: '#ffffff'
  primary-container: '#4db6ac'
  on-primary-container: '#00433f'
  inverse-primary: '#71d7cd'
  secondary: '#3b6090'
  on-secondary: '#ffffff'
  secondary-container: '#a5c8ff'
  on-secondary-container: '#2e5484'
  tertiary: '#695c50'
  on-tertiary: '#ffffff'
  tertiary-container: '#b4a395'
  on-tertiary-container: '#45392f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8ef4e9'
  primary-fixed-dim: '#71d7cd'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a5c8ff'
  on-secondary-fixed: '#001c3a'
  on-secondary-fixed-variant: '#204877'
  tertiary-fixed: '#f2dfd0'
  tertiary-fixed-dim: '#d5c3b5'
  on-tertiary-fixed: '#231a11'
  on-tertiary-fixed-variant: '#51453a'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  titular-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  titular-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  titular-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  cuerpo-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  cuerpo-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  etiqueta-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  dato-numerico:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
  titular-lg-movil:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margen-pantalla: 32px
  espaciado-tarjeta: 24px
  separacion-secciones: 48px
  rejilla-columnas: '12'
  rejilla-gutter: 24px
---

## Brand & Style

The design system is centered on a "Serene Hospitality" philosophy. It balances the professional rigor required for hotel management with the welcoming, high-end atmosphere of a boutique stay. The personality is organized, airy, and sophisticated, aiming to reduce the cognitive load of hotel staff while maintaining an aesthetic that reflects the luxury of the establishment.

The style is a **Minimalist Flat** approach. It avoids heavy gradients and complex textures in favor of generous whitespace ("espacio negativo"), precise alignment, and a soft color palette. The interface should feel like a high-end concierge service: efficient, quiet, and impeccably presented. 

Target emotional response:
*   **Confianza (Trust):** Through stable blues and clear typography.
*   **Calma (Calm):** Through soft turquoise and open layouts.
*   **Cercanía (Warmth):** Through sand accents and rounded geometry.

## Colors

The palette is inspired by coastal boutique environments. 

*   **Turquesa Suave (#4DB6AC):** The primary brand color, used for primary actions and "Ocupación" indicators. It represents freshness and the Mediterranean/Caribbean spirit.
*   **Azul Confiable (#2C5282):** Used for navigation, headers, and professional data points. It provides the "trustworthy" anchor to the system.
*   **Arena Cálida (#F4E1D2):** A warm neutral used for subtle backgrounds, accents on "Reservas" cards, and to soften the overall interface.
*   **Fondo y Neutros:** A very light slate gray is used for the background to reduce screen glare during long shifts, while pure white is reserved for high-priority "Tarjetas" (cards) and "Contenedores" (containers).

## Typography

This design system utilizes **Plus Jakarta Sans** for all interfaces. Its modern, slightly rounded letterforms echo the friendly yet professional nature of boutique hospitality.

*   **Jerarquía (Hierarchy):** Titulares (Headlines) use semi-bold and bold weights to clearly define sections like 'Panel de Control' or 'Gestión de Habitaciones'.
*   **Lectura (Reading):** Cuerpo (Body) text maintains a 1.5x line height to ensure legibility when reading guest notes or check-in details.
*   **Etiquetas (Labels):** Labels for status indicators (e.g., 'Disponible', 'Sucia', 'Mantenimiento') use a slightly tracked-out uppercase style for immediate recognition.
*   **Datos (Data):** Numeric data for pricing or room numbers uses a medium weight to stand out against descriptive text.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop and a fluid single-column model on mobile. 

*   **Desktop:** A 12-column grid with a maximum container width of 1440px. This allows for a persistent sidebar navigation on the left (2 columns) and a spacious work area.
*   **Márgenes (Margins):** Large 32px external margins provide the "plenty of white space" requested, preventing the UI from feeling cramped even when data-heavy.
*   **Ritmo Vertical (Vertical Rhythm):** An 8px base unit (incremented by 8, 16, 24, 32, 48) governs all padding and margins to ensure a consistent, predictable flow.
*   **Adaptabilidad (Responsiveness):** On tablet, the sidebar collapses into a drawer. On mobile, all "Tarjetas de Reserva" (Booking cards) stack vertically, and horizontal scrolling is permitted only for large "Tablas de Disponibilidad" (Availability charts).

## Elevation & Depth

To maintain a "Minimalist Flat" aesthetic, the design system avoids heavy shadows and traditional skeuomorphism. Depth is communicated through **Tonal Layering** and **Subtle Outlines**:

*   **Nivel 0 (Fondo):** Color 'Fondo Página' (#F8FAFC).
*   **Nivel 1 (Superficies):** Cards and main containers use pure white (#FFFFFF) with a very soft, low-opacity border (1px solid #E2E8F0). 
*   **Sombra de Enfoque (Focus Shadow):** Only active or hovered elements (like a selected 'Habitación') receive a very soft, diffused ambient shadow (0px 4px 20px rgba(77, 182, 172, 0.1)) tinted with the primary turquoise.
*   **Capas Superpuestas (Overlays):** Modals for 'Nueva Reserva' use a semi-transparent backdrop blur (4px) to keep the context of the dashboard visible while focusing the user.

## Shapes

The shape language is consistently **Rounded**, reinforcing the "welcoming" and "approachable" brand personality.

*   **Contenedores y Tarjetas:** Use `rounded-lg` (16px) for a soft, modern look.
*   **Botones y Entradas de Datos:** Use `rounded-md` (8px) to maintain a balance between friendly and functional.
*   **Indicadores de Estado (Chips):** Use full pill-shaped rounding (999px) for status indicators like 'Check-in realizado' or 'Pendiente'.
*   **Imágenes de Habitaciones:** Use the same `rounded-lg` as containers to ensure visual harmony.

## Components

*   **Botones (Buttons):**
    *   *Primario:* Background Turquesa Suave, text white. High-priority actions like 'Confirmar Reserva'.
    *   *Secundario:* Border Azul Confiable, text Azul Confiable. Secondary actions like 'Editar Perfil'.
    *   *Terciario:* Ghost style, for navigation or minor utility actions.
*   **Tarjetas de Habitación (Room Cards):** White background, subtle border, containing room number (Titular-md), status chip, and guest name. Plenty of internal padding (24px).
*   **Campos de Entrada (Input Fields):** Background Arena Cálida at 10% opacity or white with a light gray border. Focus state uses a 2px Turquesa Suave border.
*   **Selector de Calendario (Date Picker):** Clean, minimalist grid. Selected dates use the Turquesa Suave background. Current day is indicated with a small Arena Cálida dot.
*   **Indicadores (Badges/Chips):** Small, rounded-pill elements with low-saturation backgrounds (e.g., light green for 'Limpia', light red for 'Ocupada').
*   **Barra de Navegación (Sidebar):** Deep Azul Confiable background with Turquesa Suave active state indicators. Icons should be thin-line (2px) and minimalist.
*   **Tabla de Reservas (Booking Table):** High-contrast text on white rows, with alternating row colors (Arena Cálida at 5% opacity) to aid tracking across large data sets.