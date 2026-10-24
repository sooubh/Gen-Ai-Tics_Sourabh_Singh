---
name: Warm Obsidian Intelligence
colors:
  surface: '#121315'
  surface-dim: '#121315'
  surface-bright: '#38393b'
  surface-container-lowest: '#0d0e10'
  surface-container-low: '#1b1c1e'
  surface-container: '#1f2022'
  surface-container-high: '#292a2c'
  surface-container-highest: '#343537'
  on-surface: '#e3e2e4'
  on-surface-variant: '#c6c8b8'
  inverse-surface: '#e3e2e4'
  inverse-on-surface: '#303032'
  outline: '#909284'
  outline-variant: '#46483c'
  surface-tint: '#bdce8d'
  primary: '#bdce8d'
  on-primary: '#293504'
  primary-container: '#88975c'
  on-primary-container: '#222e00'
  inverse-primary: '#56642e'
  secondary: '#ffb964'
  on-secondary: '#482a00'
  secondary-container: '#8d5700'
  on-secondary-container: '#ffdab3'
  tertiary: '#ffb3ad'
  on-tertiary: '#640b0e'
  tertiary-container: '#e56b63'
  on-tertiary-container: '#5a0308'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9eaa7'
  primary-fixed-dim: '#bdce8d'
  on-primary-fixed: '#161f00'
  on-primary-fixed-variant: '#3f4c19'
  secondary-fixed: '#ffddba'
  secondary-fixed-dim: '#ffb964'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#663e00'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#842421'
  background: '#121315'
  on-background: '#e3e2e4'
  surface-variant: '#343537'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system is engineered for intelligence analysts, forensic auditors, and specialized enterprise investigators who examine sensitive cases for hours at a time. The emotional tone is deliberate, quiet, and deeply focused—evoking the gravitas of a secure operations room rather than a generic SaaS tool.

### Design Movement & Aesthetic
- **Matte Technical Minimalism:** A utilitarian, low-glare visual architecture that completely bans high-saturation neons, cyber-cyan, and electric blues.
- **Warm Monochromatic Foundations:** Built on charcoal, graphite, and soft ivory tones to reduce ocular strain during continuous forensic deep-dives.
- **Physical Document Metaphor:** Digital surfaces operate like archival folders, technical dossiers, and micro-ruled ledger paper, prioritizing information density without visual chaos.

## Colors

Color is applied with strict clinical restraint. Color is never decorative; it acts strictly as an analytical signal indicating case state, threat status, or direct user focus.

### Palette Architecture
- **Surfaces & Atmosphere:**
  - Base canvas: `#121315` (deep warm obsidian)
  - Navigation & side panels: `#1c1d21` (warm graphite)
  - Cards & inspection panels: `#23252a` (elevated grey)
  - Surface borders & dividers: `#35373e` (subtle structural lines)
- **Primary Accent (Operational Focus):**
  - Interactive default / active: `#7d8c52` (muted olive green)
  - Hover / focus highlight: `#8a9a5b`
- **Text & Content Hierarchy:**
  - Primary text: `#f3f1ea` (soft ivory, preventing the optical glare of `#ffffff`)
  - Secondary metadata & captions: `#9e9c96` (muted warm grey)
  - Tertiary/disabled state: `#5e5d59`
- **Telemetry & Status Indicators:**
  - Critical threats / severe anomalies: `#b84a44` (brick terracotta)
  - Amber alerts / pending verification: `#b87a28` (warm ochre)
  - Confirmed / verified states: `#5a8264` (understated sage)

## Typography

The typographic system utilizes **Space Grotesk** for identifiers, telemetry labels, metadata badges, and structural section headers, pairing it with **Inter** for dense evidence narratives, timelines, and analytical data grids.

### Usage Rules
- Numerical values, entity IDs, timestamps, and classification flags must render in **Space Grotesk** using tabular figures (`tnum`) for vertical alignment.
- Long-form investigative narratives, witness transcripts, and raw notes use **Inter** `body-md` or `body-lg` with relaxed line height to sustain readability.
- All uppercase metadata labels must apply tracking (`0.03em` to `0.06em`) to ensure legibility across dense data tables.

## Layout & Spacing

The layout is built for multi-pane evidence triage, featuring a high-density, modular fluid-grid workflow.

### Grid & Structure
- **Desktop (1440px+):** 12-column layout with pinned or collapsible utility panes (280px left entity sidebar, 360px right detail drawer), with dynamic center viewport and `1.25rem` gutters.
- **Tablet (768px - 1439px):** 8-column layout. Drawers transition to slide-over overlays; toolbar items collapse into contextual action groups.
- **Mobile (<768px):** Single-column stacked triage view with pinned bottom navigation and top case-level status pills.

### Density Calibration
Spacing scale favors compact rhythms (`space-sm` for table rows, `space-md` for form fields) to maximize information visible without scrolling.

## Elevation & Depth

To prevent optical fatigue, this design system avoids multi-layer diffused drop shadows. Spatial depth is established through tonal layering, crisp surface contrast, and ghost outlines.

### Depth Mechanics
- **Ground Floor (Base Canvas):** `#121315` remains unbordered.
- **Level 1 (Panels & Sidebar):** `#1c1d21` with a single right or bottom border of `#35373e`.
- **Level 2 (Cards, Table Containers, Inspector Blocks):** `#23252a` enclosed entirely with a 1px solid border of `#35373e`.
- **Level 3 (Modals, Overlays, Floating Menus):** `#2a2c32` with a 1px solid border of `#464952` and a tightly localized matte shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.65)`.

## Shapes

The geometric signature is grounded, sharp, and architectural. 

### Geometric Rules
- Base components (buttons, input boxes, cards, tags) use a subtle **4px** (`0.25rem`) radius.
- Large containers and modal shells use an **8px** (`0.5rem`) radius.
- Circular or pill geometries are reserved exclusively for counter badges, numeric notification tags, and live status dots. Pill buttons are prohibited.

## Components

### Buttons
- **Primary Action:** Solid background `#7d8c52`, text `#f3f1ea`, font `label-lg`. Active state shifts to `#657538`. No glow effects.
- **Secondary Action:** Background `#23252a`, border 1px solid `#35373e`, text `#f3f1ea`. Hover sets background to `#2a2c32` and border to `#7d8c52`.
- **Destructive/Emergency Action:** Border 1px solid `#b84a44`, background `rgba(184, 74, 68, 0.12)`, text `#b84a44`.

### Input Fields & Search Queries
- Container background `#161719` with a 1px border of `#35373e`.
- Text typed in `#f3f1ea` (`Inter body-md`). Placeholder text in `#9e9c96`.
- Focus ring: 1px continuous outline in muted olive green `#7d8c52` with zero blur or outer spread.

### Chips & Analytical Tags
- Fixed height of 24px, Space Grotesk `label-sm`, letter spacing `0.05em`.
- **Entity Flag:** `#1c1d21` background, 1px border `#35373e`, text `#9e9c96`.
- **Target Threat Flag:** `rgba(184, 74, 68, 0.15)` fill, `#b84a44` border, `#f3f1ea` text.
- **Verified Fact Tag:** `rgba(90, 130, 100, 0.15)` fill, `#5a8264` border, `#f3f1ea` text.

### Data Cards & Evidence Cells
- Solid fill `#23252a` bounded by a 1px stroke of `#35373e`.
- Card headers feature an integrated Space Grotesk `label-md` section tracker, separated from content with a hairline rule (`#35373e`).

### Checkboxes & Radios
- Size 16x16px, background `#161719`, border 1px solid `#35373e`.
- Checked state replaces inner surface with solid `#7d8c52` and ivory checkmark `#f3f1ea`.

### Timeline & Entity Nodes
- Monospaced timeline ticks with 1px vertical tracks in `#35373e`. Active path highlights transition to `#7d8c52`.