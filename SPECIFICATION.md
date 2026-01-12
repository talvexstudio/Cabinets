# Cabinets Application Specification

## 1. Project Overview
**Name**: Cabinets
**Description**: A 3D parametric cabinet design tool that generates real-time 3D visualizations and professional 2D technical drawings (Plan, Elevation, Section).
**Purpose**: To allow users to configure cabinet dimensions and features, view them in 3D, and export standard technical documentation.

## 2. Technology Stack
*   **Framework**: React 19 (via Vite)
*   **Language**: TypeScript
*   **3D Engine**: Three.js (via `@react-three/fiber`)
*   **3D Utilities**: `@react-three/drei` (OrbitControls, ContactShadows, View, etc.)
*   **Animation**: `@react-spring/three` (Door animations)
*   **State Management**: Zustand
*   **Styling**: Vanilla CSS (Global styles + Flexbox layout)
*   **Build Tool**: Vite

## 3. Data Model (State)
Managed via `zustand` in `src/store/useStore.ts`.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `width` | `number` | `1200` | Cabinet total width (mm) |
| `height` | `number` | `900` | Cabinet box height (mm) |
| `depth` | `number` | `600` | Cabinet total depth (mm) |
| `numDoors` | `number` | `2` | Number of doors (1 or 2) |
| `doorsOpen` | `boolean` | `true` | Visual state of doors (0° or 90°) |
| `numShelves` | `number` | `2` | Number of internal shelves |
| `floorHeight` | `number` | `0` | Elevation from floor (mm) |
| `cabinetColor` | `string` | `'#58737e'` | Hex color for cabinet finish |

## 4. Architecture & Layout
The application uses a **Split-View** layout (`App.tsx`):
1.  **Sidebar** (Right): Contains all UI controls (Inputs, Sliders, Buttons).
2.  **Main Area** (Left): Divided vertically.
    *   **Main 3D Viewport** (Top): Interactive perspective view.
    *   **Tech Viewports** (Bottom): 3 side-by-side 2D technical views.

**View System**: Uses `View` from `@react-three/drei` to render multiple viewports into a single shared `<Canvas>` for performance.

## 5. Core Components

### 5.1 `Cabinet.tsx`
The heart of the application. It renders the parametric 3D model.
*   **Props**: `isTech` (boolean), `viewMode` ('plan' | 'elevation' | 'section').
*   **Logic**:
    *   Calculates panel sizes based on `width`, `height`, `depth`.
    *   Iterates to create `numShelves`.
    *   Calculates door sizes and hinge positions.
    *   **Dimensions**: Renders `DimensionLine` components if `isTech` is true. Logic varies by `viewMode` to show relevant dimensions only.
    *   **Door Arcs**: Renders `DoorSwingArc` (dashed line, black) only in 'Plan' view when doors are open.
*   **Materials**:
    *   **3D Mode**: `meshStandardMaterial` with color and shadows.
    *   **Tech Mode**: `meshBasicMaterial` (White) with `Edges` (Black) for CAD-like look.

### 5.2 `AnimatedDoor` (inside `Cabinet.tsx`)
*   Uses `useSpring` to animate rotation (0 to 90 degrees).
*   Handles "Hinge Left" vs "Hinge Right" logic.
*   Contains the `DoorSwingArc` logic.

### 5.3 `TechViewports.tsx`
Manages the three 2D views (Plan, Elevation, Section).
*   **Unified Scaling**: Calculates a `globalMaxEnvelope` (largest dimension across all views) to ensure all three views share the exact same zoom level (`1:1` relative to each other).
*   **ResponsiveCamera**: Custom component that adjusts Orthographic zoom based on the HTML element size to fit the content perfectly with a safe margin.
*   **Lighting**: Pure `ambientLight` for flat 2D look. Shadows are DISABLED for clean drafting.

### 5.4 `MainViewport.tsx`
Manages the 3D perspective view.
*   **Lighting**:
    *   `AmbientLight` (Intensity 1.2)
    *   `DirectionalLight` (Front-Right `[2500, 5000, 2500]`, Intensity 1.5, Casts Shadows)
    *   `PointLight` (Fill light)
*   **Environment**:
    *   `GridHelper` fixed at `Y=0`.
    *   `ContactShadows` fixed at `Y=0` (renders soft ambient shadows).
    *   Cabinet floats above grid based on `floorHeight`.

## 6. Key Features Specification

### 6.1 Cabinet Parametrics
*   **Panel Thickness**: Constant (e.g., 18mm or 20mm).
*   **Shelves**: Evenly spaced inside the cabinet box.
*   **Doors**:
    *   1 Door: Hinged Left.
    *   2 Doors: Left hinged Left, Right hinged Right.
    *   Gap: Small gap between doors (2mm).

### 6.2 Application Logic
*   **Scaling**: All technical drawings are orthogonal. The scale is dynamic but unified.
*   **View Fitting**: The camera automatically zooms in/out so the cabinet always fills ~85% of the viewport.
*   **Shadows**:
    *   **3D**: High-quality directional + contact shadows on the floor.
    *   **2D**: No shadows. Pure lines and solid fills (White/Black).

### 6.3 Technical Drawing Standards
*   **Lines**: Black edges, White fill.
*   **Background**: White/Transparent (canvas overlay).
*   **Dimensions**:
    *   Font: Standard, scaling with viewport.
    *   Arrows: Ticks or arrows.
    *   Placement: "Top/Left" strategy (dimensions usually above or to the left/right consistent with drafting standards).
*   **Door Swing**: Dashed, thin, black 90-degree arc in Plan view.

## 7. Assets & Dependencies
*   `three` (Core 3D)
*   `react-three-fiber` (React binding)
*   `drei` (Helpers)
*   `react-spring` (Animation)
*   `zustand` (State)
