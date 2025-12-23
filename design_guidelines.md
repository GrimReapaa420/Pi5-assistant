# Pironman5 HA Addon Design Guidelines

## Design Approach
**Selected Framework:** Material Design 3 (monitoring dashboards, data visualization)  
**Rationale:** Information-dense hardware monitoring interface requiring clear data hierarchy and component structure

## Typography System
- **Heading Font:** Inter (via Google Fonts CDN)
- **Body/Data Font:** JetBrains Mono for numerical values, Inter for labels
- **Hierarchy:**
  - h1: text-2xl font-semibold (Page titles)
  - h2: text-lg font-medium (Section headers)
  - h3: text-base font-medium (Component labels)
  - Body: text-sm (General text)
  - Data: text-base font-mono (Numerical readings)

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (p-4, gap-6, m-8)  
**Container:** max-w-7xl with p-6 inner padding  
**Grid System:** CSS Grid for dashboard cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

## Core Components

### Navigation
- Persistent sidebar (240px width) with collapsible mobile drawer
- Tab-based navigation for Dashboard, Configuration, Logs sections
- Status indicator badge in sidebar showing system health

### Dashboard Layout
**Primary View:** Multi-column card grid displaying:
- System monitoring cards (2x2 or 3x3 grid)
- Real-time metric cards: CPU temp, fan speed, storage, RGB status
- Each card: Icon header + large numerical value + unit label + mini trend line

### Configuration Interface
**Layout:** Two-column form layout (md:grid-cols-2)
- Left: Form inputs with clear labels
- Right: Live preview/current status
- Polling interval: Number input with slider (1-60 seconds range)
- WebUI toggle: Prominent switch with description
- Settings organized in collapsible sections with clear borders

### Data Visualization
- Line charts for temperature/fan trends (lightweight chart library via CDN)
- Progress bars for storage/memory usage
- Status pills for boolean states (Active/Inactive, On/Off)

## Component Library

### Cards
- Elevated surface with rounded corners (rounded-lg)
- Consistent padding (p-6)
- Header with icon + title
- Content area with generous spacing

### Form Elements
- Text inputs: Full-width with clear labels above
- Number inputs: Include +/- buttons for polling intervals
- Toggles: Material-style switches with on/off labels
- Dropdowns: Native select with custom styling

### Status Indicators
- Dot indicators for system health (8px circle)
- Badge pills for service states
- Alert banners for warnings/errors (border-l-4 accent)

### Buttons
- Primary: Solid fill for save/apply actions
- Secondary: Outlined for cancel/reset
- Icon buttons: For refresh, settings, expand actions

## Icons
**Library:** Material Icons (via CDN)  
**Usage:** 
- 24px for card headers
- 20px for navigation items
- 16px for inline actions

## Responsive Behavior
- **Mobile:** Single column stack, collapsible sidebar
- **Tablet:** 2-column grid
- **Desktop:** 3-column grid with persistent sidebar

## Data Display Patterns
- Numerical values: Large, bold, center-aligned within cards
- Units: Smaller, lighter weight next to values
- Timestamps: text-xs with muted treatment
- Refresh indicators: Subtle spinner icon in card header

## Accessibility
- Keyboard navigation for all interactive elements
- ARIA labels for icon-only buttons
- Focus indicators with visible outlines
- Sufficient contrast for all text on backgrounds

No images required - this is a functional dashboard interface prioritizing clarity and data readability.