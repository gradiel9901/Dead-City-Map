# Dead City — Tactical Map & Horde Mode Simulator

Interactive tactical level-design visualization, horde wave simulator, co-op mission playback, and fairness analyzer for the Dead City co-op shooter map.

## Overview
- **Visual Source of Truth**: Faithfully visualizes the Dead City level layout (300m × 330m coordinate grid).
- **View Modes**:
  - **2D Tactical View**: Orthographic top-down camera with clean tactical map symbology.
  - **3D Recon View**: Perspective camera with extruded 3D buildings, elevated Central Bridge overpass (+3.5m deck), dynamic shadows, and objective beacons.
- **Wave Flow Simulator**: 5 distinct waves (Perimeter Pressure, Alley Push, Overpass Breach, Central Plaza Siege, Extraction) with instanced horde agents, soft separation, and dynamic heatmap accumulation.
- **Mission Playback**: Real-time simulation of Player 1 and Player 2 navigating routes, collecting Data Drives (0/3 to 3/3), and triggering extraction lockdown.
- **Fairness & Pacing Analyzer**: Dijkstra navigation graph calculating shortest paths from S1 and S2 to objectives with balance verdicts and click-to-draw path inspection.
- **Interactive Tools**:
  - Distance measurement tool (M)
  - 80m sightline visibility probe (V)
  - Numbered co-op pings (Shift+Click, toggle P1/P2 with P, JSON export)
  - 7-step guided tour of design intent (G)

## Running the Project
```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build production bundle
npm run build
```
Note: Dev server binds to `0.0.0.0:3000`.

## Editing Map Data
All positions, routes, buildings, and wave parameters are defined in `src/data/mapData.ts`:
- **Add / Move Markers**: Modify coordinates in `SPAWNS`, `OBJECTIVES`, `HORDE_ENTRIES`, or `CHOKEPOINTS`.
- **Change Wave Tuning**: Adjust agent counts or path targets in `WAVES`.
- **Adjust Buildings**: Change footprint `[x0, z0, x1, z1]` and height `h` in `BUILDINGS`.

## Asset Handling
- The app uses procedural canvas textures for ground terrain, roads, pavers, grass, roofs, and facades.
- If customized Nano Banana textures are placed in `/assets/`, they are seamlessly loaded and magenta backgrounds are chroma-keyed automatically with fringe despill.
