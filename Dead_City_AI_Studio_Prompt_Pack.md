# DEAD CITY — Horde Mode Interactive Level Map
## Prompt Pack for Google AI Studio (Gemini Pro) + Nano Banana

**Contents**
1. How to run this pack (workflow + AI Studio settings)
2. PART A — Nano Banana asset prompts (generate these FIRST)
3. PART B — MASTER BUILD PROMPT (paste into AI Studio)
4. PART C — Follow-up / iteration prompts
5. Designer's notes (assumptions and balance observations)

---

## 1. How to run this pack

**Order of operations**

1. **Crop the map panel** out of your layout poster (the dark central map only, no side panels). Save as `layout_map_crop.png`.
2. Open AI Studio → image generation with **Nano Banana**. Run **Part A**: first the *Style Lock*, then Asset 00 (hero ground plate, image-to-image from your crop), then the rest. Always request the highest resolution available and downscale to the sizes listed.
3. Save every output using the exact filenames in the manifest (Part A, section A6).
4. Open a fresh AI Studio **Gemini Pro** chat/Build session. Attach `Dead_City_Horde_Mode_Level_Layout.png` (the full poster) and, if you have them, the asset files. Paste **Part B** as your first message.
5. If the output cuts off, paste the *Continue* prompt from Part C. Then use the polish / performance / bug prompts as needed.

**Recommended AI Studio settings**

- Model: strongest Gemini Pro available, thinking/reasoning ON.
- Max output tokens: maximum. Temperature: 0.4–0.6 (code accuracy over creativity).
- Run Part B as the very first message of a clean session so no earlier context dilutes it.

**Why Nano Banana assets are chroma-keyed:** image models do not reliably output true transparency. Sprite and icon prompts therefore demand a flat **#FF00FF magenta** background, and the app removes it at load time with a chroma-key routine (specified in Part B). You get clean transparent sprites without any manual cutout.

---

# PART A — NANO BANANA ASSET PROMPTS

## A1. STYLE LOCK (paste before every asset prompt, or at the start of the session)

````
STYLE LOCK for the "Dead City" asset set. Apply to every image in this session.
Look: stylized-realistic tactical-briefing art for a post-outbreak abandoned city, as seen on a military operations table. Desaturated palette: deep navy and slate greys, muted teal shadows, overgrown dark-green vegetation, weathered concrete, faded asphalt. Only small accent colors are allowed: warning yellow #FFD21F, horde red #E5202A, player cyan #1EAEEF, extraction green #2ECC40.
Lighting: soft overcast daylight with the light source in the top-left (north-west). Keep surfaces neutral and flat-lit. DO NOT paint cast shadows or baked shadows into any asset (shadows are added in the game engine).
Detail: crisp, clean edges, mid-frequency detail readable at small size, no motion blur, no depth of field, no lens effects.
Hard rules: no text, no letters, no numbers, no watermark, no logos, no UI frames, no people, no gore. Consistent scale and consistent color grade across all assets.
Requested resolution: highest available.
````

## A2. Asset 00 — Hero ground plate (image-to-image, attach `layout_map_crop.png`)

````
Using the attached top-down level layout as strict composition reference, repaint it as a clean, photorealistic-stylized top-down (orthographic, straight-down) ground plate of an abandoned, overgrown city district. Keep every building footprint, road, plaza, park area, bus depot lot, and extraction lawn in EXACTLY the same position and proportion as the reference. REMOVE all icons, arrows, dashed lines, markers, labels, letters, scale bar, north arrow and borders. Roads: cracked asphalt with faint lane markings and scattered debris. Central plaza: worn pale-grey pavers with a circular dry fountain at its center. Park / ruins area: dense dark-green tree canopies and collapsed concrete walls. Bus depot: concrete lot with bay markings. Extraction area (right of bus depot): a mowed green lawn with a faint concrete pad. Buildings seen from above as flat grey rooftops with AC units and skylights, NO baked shadows. Square output, 1:1, highest resolution.
````
*Use: base ground texture in both the 2D tactical view and the 3D view. If you skip this, the app falls back to its procedural terrain.*

## A3. Seamless tileable textures (1:1, downscale to 1024×1024)

Prefix each with the Style Lock. Add to the end of each: *"Perfectly seamless tileable texture, top-down orthographic, uniform lighting, no vignette, no focal point."*

| File | Prompt body |
|---|---|
| `tex_asphalt.png` | Cracked, patched, weathered dark asphalt with faded yellow lane-paint remnants, scattered gravel and leaf litter. |
| `tex_plaza_pavers.png` | Worn pale-grey concrete pavers in a regular grid, moss in the joints, small cracks, light dust. |
| `tex_grass_overgrown.png` | Dense overgrown wild grass and weeds, dark green with dry patches, no flowers. |
| `tex_dirt_rubble.png` | Brown-grey compacted dirt with small concrete chunks, brick fragments and gravel. |
| `tex_sidewalk.png` | Light-grey concrete sidewalk slabs with expansion joints, stains and small cracks. |
| `tex_extraction_lawn.png` | Short mowed green lawn, slightly brighter than the wild grass, subtle mowing stripes. |

## A4. Building roofs (top-down, 1:1, 1024×1024) — *Style Lock prefix, "flat-lit, no shadows, orthographic straight-down"*

| File | Prompt body |
|---|---|
| `roof_west_block.png` | Rooftop of a mid-rise residential block: tar-paper roof, stairwell hatches, water tanks, antennas, a few collapsed patches. |
| `roof_office_block.png` | Rooftop of a corporate office block: grey membrane roof, rows of HVAC units, glass atrium skylight, helipad-style faded marking. |
| `roof_east_towers.png` | Rooftop of a twin-tower high-rise: concrete roof with cooling units, elevator machine rooms, red aircraft-warning light housings (unlit). |
| `roof_metro_district.png` | Rooftop of a transit hub building: long glass-and-steel canopy strips, ventilation shafts, faded metro roundel shape WITHOUT any text. |
| `roof_bus_depot.png` | Long industrial depot roof: corrugated metal panels, skylights, rust streaks, a few holes. |
| `roof_generic_01.png` / `02` / `03` | Three different small-building roofs: gravel flat roof / metal sheet roof / broken tile roof, each with minor props. |

## A5. Facades, sprites and icons

**Facade textures (tileable vertically and horizontally, 2:3, downscale to 512×768)** — *Style Lock prefix, front-on flat elevation, no perspective, no shadows*

| File | Prompt body |
|---|---|
| `facade_residential.png` | Weathered apartment facade: pale concrete, regular window grid with broken and boarded windows, balconies, water stains. |
| `facade_office_glass.png` | Curtain-wall office facade: dark tinted glass panels with cracks and missing panes, steel mullions, grime. |
| `facade_tower_concrete.png` | Brutalist concrete tower facade: narrow vertical window slits, stained concrete panels, rusted rebar streaks. |
| `facade_metro_tile.png` | Transit station facade: cream ceramic tile with dark-blue band, dirty and chipped, large arched openings, NO text. |

**Top-down sprites (1:1, 512×512)** — *Style Lock prefix, then:* **"Isolated single object, viewed straight down from above, centered, on a FLAT SOLID PURE MAGENTA #FF00FF background with no gradient, no shadow, no glow, magenta must not appear anywhere inside the object."**

| File | Subject |
|---|---|
| `spr_tree_01.png`, `spr_tree_02.png`, `spr_tree_03.png` | Three different dense tree canopies, dark green, round-irregular silhouettes, different sizes and leaf clumping. |
| `spr_bush_cluster.png` | Cluster of overgrown shrubs and tall weeds. |
| `spr_rubble_01.png`, `spr_rubble_02.png` | Two piles of collapsed concrete, rebar and brick debris. |
| `spr_car_wreck_01.png`, `spr_car_wreck_02.png`, `spr_car_wreck_03.png` | Abandoned rusted sedan, SUV and van, each different color-faded. |
| `spr_bus_wreck.png` | Abandoned city bus, 3:1 proportion, faded white and blue livery without any text, flat tires. |
| `spr_barricade_sandbag.png` | Curved sandbag barricade, olive and tan. |
| `spr_barricade_concrete.png` | Row of concrete jersey barriers with yellow-black hazard stripes. |
| `spr_supply_crate.png` | Military supply crate with an open lid showing ammo boxes, olive green with a subtle green cross emblem. |
| `spr_fountain.png` | Dry circular plaza fountain with a cracked central pedestal, filled with debris. |
| `spr_horde_cluster.png` | Dark crowd of shambling silhouettes seen from above (heads and shoulders only), desaturated, NO gore, readable as a "crowd mass". |

**UI icons (1:1, 256×256)** — *Style Lock prefix, then:* **"Flat vector emblem icon with a thick dark-navy outline, subtle inner bevel, centered, on a FLAT SOLID PURE MAGENTA #FF00FF background, no shadow, no text."**

| File | Subject |
|---|---|
| `icon_player_spawn.png` | Cyan circular badge with a person silhouette. |
| `icon_data_drive.png` | Yellow diamond hazard-style badge containing a USB data drive. |
| `icon_horde_entry.png` | Red downward arrow badge. |
| `icon_chokepoint.png` | Red circular bullseye badge. |
| `icon_supply.png` | Green square badge with a plus sign. |
| `icon_vehicle.png` | White bus silhouette on a dark-navy badge. |
| `icon_extraction.png` | Green triangle badge with an upward chevron. |

**Brand banner (16:5, 1600×500)** — `logo_dead_city.png`
````
Wide title banner reading exactly "DEAD CITY" in heavy, condensed, bold sans-serif capital letters, off-white with a subtle worn-metal texture, set on a dark navy (#0E1A2B) background. A thin horizontal rule and the small line "HORDE MODE" in a lighter condensed face beneath it. Clean, flat, tactical-briefing look, no extra decoration, no watermark.
````
*(This is the only asset allowed to contain text.)*

## A6. Asset manifest (put in `/assets/`)

```
/assets
  hero_ground_plate.png        (Asset 00, 2048x2048)
  tex_asphalt.png  tex_plaza_pavers.png  tex_grass_overgrown.png
  tex_dirt_rubble.png  tex_sidewalk.png  tex_extraction_lawn.png      (1024x1024)
  roof_west_block.png  roof_office_block.png  roof_east_towers.png
  roof_metro_district.png  roof_bus_depot.png
  roof_generic_01.png  roof_generic_02.png  roof_generic_03.png       (1024x1024)
  facade_residential.png  facade_office_glass.png
  facade_tower_concrete.png  facade_metro_tile.png                     (512x768)
  spr_tree_01.png  spr_tree_02.png  spr_tree_03.png  spr_bush_cluster.png
  spr_rubble_01.png  spr_rubble_02.png
  spr_car_wreck_01.png  spr_car_wreck_02.png  spr_car_wreck_03.png
  spr_bus_wreck.png  spr_barricade_sandbag.png  spr_barricade_concrete.png
  spr_supply_crate.png  spr_fountain.png  spr_horde_cluster.png        (512x512, magenta key)
  icon_player_spawn.png  icon_data_drive.png  icon_horde_entry.png
  icon_chokepoint.png  icon_supply.png  icon_vehicle.png
  icon_extraction.png                                                  (256x256, magenta key)
  logo_dead_city.png                                                   (1600x500)
```

---

# PART B — MASTER BUILD PROMPT (paste into AI Studio)

````
ROLE
You are a principal level designer AND senior WebGL / front-end engineer with 15+ years of shipping tactical-map tools and co-op shooter levels. You will build a complete, production-ready, interactive level-design visualization of a Horde Mode map called "DEAD CITY". Think of it as the in-engine "level briefing table" a studio would use to present, review and balance a co-op map.

SOURCE OF TRUTH
I attached the full level layout poster (Dead_City_Horde_Mode_Level_Layout.png). The poster is the visual source of truth for positions, labels, routes and copy. The data tables below are measured from it and are your starting values; where they conflict with what you see in the poster, follow the poster and keep the data file in sync.

OUTPUT PROTOCOL (STRICT)
- Deliver COMPLETE files, each in its own code block, preceded by its exact path as a heading.
- NEVER use placeholders, "TODO", "...", "rest of code unchanged", pseudo-code or stubs. Every function must be fully implemented.
- File order: index.html, css/styles.css, js/data.js, js/renderer.js, js/world.js, js/overlays.js, js/sim.js, js/ui.js, js/main.js, README.md.
- If you are about to hit the output limit, STOP cleanly at a file boundary and write exactly: "CONTINUE FROM: <next file path>". I will reply "continue" and you resume with that file in full. Never truncate a file mid-way.
- After all files, add a short "Smoke-test checklist" I can follow in the browser.

TECH CONSTRAINTS
- Pure static web project: HTML + CSS + vanilla JavaScript (ES modules). No build step, no Node, no backend, no frameworks (no React/Vue).
- Rendering via WebGL using Three.js (pin r160) loaded from an import map pointing to https://cdn.jsdelivr.net/npm/three@0.160.0/ (include OrbitControls, EffectComposer, RenderPass, UnrealBloomPass, OutputPass, CSS2DRenderer from /examples/jsm). Use WebGL2 renderer; if WebGL is unavailable show a styled error panel.
- Must run when served by any static host (GitHub Pages, InfinityFree, `python -m http.server`). State in README that ES modules require http(s), not file://.
- Google Fonts allowed: "Barlow Condensed" (headings, labels), "Barlow" (body), "JetBrains Mono" (coordinates and numbers).
- All assets are loaded from /assets using the filenames in the ASSET MANIFEST. Every asset load MUST fail gracefully: if a file is missing, generate a matching procedural fallback (canvas-drawn texture / geometry) and log one console warning. The app must never crash and must look finished with or without the images.
- Target 60 fps on integrated GPUs at 1080p; cap devicePixelRatio at 2; use InstancedMesh for trees, shrubs, rubble, supply crates, wrecks and horde agents; dispose geometries/materials properly; pause rendering when the tab is hidden.

VISUAL DIRECTION
- UI layout mirrors the poster: top header bar "DEAD CITY | HORDE MODE  LEVEL LAYOUT" (use logo_dead_city.png if present, else styled text), left column panels (SHORT EXPLANATION, OBJECTIVES), center viewport, right column panels (LEGEND, DESIGN INTENT, WAVE FLOW, HORDE ENTRY LANES / KEY CHOKEPOINTS), footer strip "SURVIVE  /  COLLECT  /  EXTRACT". On screens under 1100 px the side columns become slide-over drawers with tab buttons; under 700 px the HUD becomes a bottom sheet. Fully touch-friendly (pinch zoom, two-finger rotate, tap for info).
- Design tokens (CSS variables): --bg #0B1424, --panel #0F1E33, --panel-2 #14263F, --line #2A3F5C, --ink #E8EEF6, --muted #8FA3BC, --yellow #FFD21F, --red #E5202A, --cyan #1EAEEF, --green #2ECC40. Light panel variant (#E9EDF2 background, navy text) for the SHORT EXPLANATION and OBJECTIVES cards to echo the poster. Headings in Barlow Condensed 700 uppercase with letter-spacing.
- Atmosphere: dusk lighting by default (directional key light from north-west, hemisphere fill, soft PCF shadows, exponential fog), with time-of-day presets: DUSK, NIGHT (objective beacons and extraction glow with bloom), OVERCAST DAY. Subtle vignette and film grain as CSS overlays. Respect prefers-reduced-motion by disabling pulses, grain and camera easing.
- Overall mood: dark, cinematic, editorial tactical briefing; crisp, never cartoonish.

COORDINATE SYSTEM AND SCALE
- 1 world unit = 1 meter. Origin = north-west corner of the playable area. +X = east, +Z = south, +Y = up. Playable area = 300 m (X) by 330 m (Z). (Derived from the poster scale bar: 100 m ≈ 235 px; map panel ≈ 700 x 773 px.)
- North arrow and scale bar must render in the viewport HUD and update with zoom.

THE MAP — DATA (put exactly this in js/data.js as exported constants, then extend as needed)

SPAWNS
- S1 "Spawn 1" (18, 99), faces east. Near West Block.
- S2 "Spawn 2" (284, 99), faces west. Near East Towers and Metro entrance.

OBJECTIVES (Data Drives)
- OBJ1 "Data Drive 1 — Central Plaza (near fountain)" at (150, 99). Fountain prop at (150, 138).
- OBJ2 "Data Drive 2 — Metro District (inside metro station)" at (227, 175). Metro entrance at (227, 126).
- OBJ3 "Data Drive 3 — Bus Depot (inside bus terminal)" at (192, 276).
- EXTRACTION "Extraction Point" pad at (262, 279), rectangle x 243–286, z 251–300. Next to the Bus Depot. LOCKED (grey/red beam) until 3/3 drives collected, then UNLOCKED (green pulse + beam).

HORDE ENTRIES
- H1 "North West (West Block)" (69, 7) heading south
- H2 "North (Central Road)" (204, 10) heading south
- H3 "South West (Park Entrance)" (136, 323) heading north
- H4 "South East (Bus Depot)" (234, 323) heading north

CHOKEPOINTS (radius 14 m each, rendered as red pulsing ring + vertical danger cylinder)
- CP1 "North Alley" (150, 78) — between West Block and Plaza
- CP2 "Central Bridge" (150, 183) — plaza entrance (treat as the overpass in Wave 3)
- CP3 "South Gate" (150, 268) — between Park and Bus Depot

ZONES
- Contested Zone (red dashed, animated pulse): Central Plaza rect x 119–181, z 82–167.
- Safe Zone (green dashed): Bus Depot compound rect x 159–226, z 221–308.
- Extraction pad zone: x 243–286, z 251–300 (lush lawn).

BUILDINGS (footprints x0,z0,x1,z1 in meters, height in meters). Use box/extruded geometry with roof textures on top and facade textures on sides, rooftop props, window-emissive at night.
- A "West Block": 39,28,103,92 h 24
- B "Office Block": 63,112,108,168 h 22
- C "East Towers": two towers 192,35,222,104 h 38 and 228,35,256,104 h 30 (connected podium h 8)
- D "Metro District": 200,126,254,200 h 18 (station entrance on north face at x 227)
- E "Park / Ruins": open park 35,193,134,296 with 4 partially collapsed ruin structures h 4–8 at (50,207,70,228), (36,270,60,290), (121,235,130,262), (68,200,80,212)
- F "Bus Depot": 172,230,219,272 h 9 with open bays facing south; 2 bus wrecks inside.
- Minor buildings: (131,28,145,58) h 30 | (177,42,184,58) h 8 | (264,35,278,60) h 20 | (47,106,60,126) h 10 | (45,151,59,170) h 8 | (131,190,142,205) h 8 | (164,190,176,205) h 8 | (264,125,278,145) h 12
- Every building gets its letter label as a CSS2D tag in the poster style (dark rounded tag with white condensed text): A WEST BLOCK, B OFFICE BLOCK, C EAST TOWERS, D METRO DISTRICT, E PARK / RUINS, F BUS DEPOT. Labels scale with zoom and hide when overlapping at far zoom.

STREETS (asphalt texture, sidewalks 2.5 m both sides)
- Central avenue N–S: x 140–160, z 0–330.
- Cross street E–W: z 176–192, x 0–300 (Central Bridge crossing at x 140–160).
- North lane E–W: z 94–110 between the West Block / East Towers and Office Block / Metro District.
- East side street N–S: x 227–241, z 190–330.
- Perimeter ring road 14 m wide, inset 8 m from the edge.
- Bridge: the CP2 crossing is a raised overpass deck (+3.5 m) over the cross street with ramps; players can see it clearly in 3D.

VEGETATION AND DEBRIS
- Dense tree cover in E Park (≈70 % canopy), medium around A and B, light around the plaza rim, none on roads. Use spr_tree_01–03 as camera-facing billboards in the 2D tactical view and as canopy discs on trunks in 3D. Seeded random placement (seed 1913) so the map is identical every load; avoid overlaps with buildings and routes.
- Rubble clusters around the plaza edge, near CP1 and CP2, in the Park ruins, and along the east side street.

SUPPLY / AMMO CACHES (green plus icon + crate prop)
(125,89) (175,89) (124,142) (186,141) (206,120) (65,187) (199,219) (272,228) (95,255) (150,290)

VEHICLES
Bus wrecks: (195,250) and (205,262) inside the depot. Car wrecks: 10 seeded positions along the central avenue and cross street, none blocking player routes.

ROUTES (polylines in meters). Render as glowing flowing-dash lines on the ground with animated arrowheads (custom ShaderMaterial, flow speed adjustable)
- PLAYER ROUTES (cyan, solid arrows)
  - PR1 S1→OBJ1: (18,99) (44,99) (102,99) (126,99) (150,99)
  - PR2 S2→OBJ1: (284,99) (275,115) (243,115) (207,115) (181,108) (150,99)
  - PR3 OBJ1→OBJ2: (150,99) (181,120) (207,120) (227,122) (227,130) (227,175)
  - PR4 OBJ2→OBJ3: (227,175) (234,200) (234,240) (205,270) (192,276)
  - PR5 OBJ3→EXTRACTION: (192,276) (222,282) (262,279)
  - PR6 S1→OBJ3 south lane: (18,99) (21,123) (42,187) (108,191) (150,183) (150,215) (150,268) (172,276) (192,276)
- FLANK ROUTES (yellow, dash-dot arrows)
  - FL1 West–North: (21,123) (30,100) (44,97) (102,97) (108,89) (150,78) (181,78)
  - FL2 West–South–East loop: (21,123) (21,170) (42,187) (108,191) (129,187) (150,183) (172,187) (189,206) (200,213) (252,213) (266,198) (275,187) (275,125)
  - FL3 East–North: (273,78) (262,86) (243,112) (207,113) (181,110)
  - FL4 South-West park loop: (150,268) (136,285) (136,297) (100,298) (67,298) (40,260) (30,215) (42,187)
- EXTRACTION ROUTES (green, dash arrows)
  - ER1: (192,276) (165,276) (165,303) (225,303) (262,290) (262,279)
  - ER2 support lane: (234,318) (234,260) (234,215)
- HORDE ENTRY ARROWS: large red down/up arrows at H1–H4 with pulsing glow and a short animated stream of red chevrons along each entry lane toward the nearest chokepoint.

LEGEND (interactive: every row is a layer toggle with eye icon; hover highlights that layer in the scene)
Player Spawn | Objective (Data Drive) | Horde Entry (H1–H4) | Chokepoint (CP1–CP3) | Safe Zone | Contested Zone | Building / Structure | Street / Road | Vegetation / Trees | Rubble / Debris | Flank Route | Extraction Route | Player Route | Supply / Ammo | Bus / Vehicle | Extraction Point
Use the icon_*.png assets when present (chroma-keyed) else draw vector SVG equivalents that match the poster.

PANEL COPY (use verbatim)
SHORT EXPLANATION (numbered 1–5 cards, question bold, answer regular)
1. What is the game mode of your map? — The game mode is Horde Mode, where players work together to survive waves of enemies in an abandoned city.
2. Where do the players spawn? — Players spawn at two locations: Spawn 1 near the West Block and Spawn 2 near the East Towers and Metro Entrance.
3. What is the main objective? — The main objective is to collect key items and complete the required tasks to reach the extraction point and escape the city.
4. Where is the chokepoint? — The main chokepoints are the North Alley near the West Block, the Central Bridge near the plaza, and the South Gate between the Park and Bus Depot. These narrow areas make it harder for enemies to pass through.
5. How did you make the map fair and balanced? — I made the map fair by providing two spawn points, multiple routes, cover, and supply locations. Both players can reach the objectives, while the different paths give them options to avoid enemies or defend important areas together.
OBJECTIVES
MAIN OBJECTIVE — Collect all 3 Data Drives scattered around the city and bring them to the Extraction Point.
Data Drive 1 — Central Plaza (near fountain) | Data Drive 2 — Metro District (inside metro station) | Data Drive 3 — Bus Depot (inside bus terminal)
EXTRACTION — Reach the extraction point at the Bus Depot after collecting all 3 data drives.
DESIGN INTENT: 2-player co-op | 3 main lanes (north, center, south) | Rotating horde pressure | Central objective is exposed | Chokepoints are powerful but risky | Flank routes prevent camping
WAVE FLOW: Wave 1 — Perimeter pressure | Wave 2 — Alley push | Wave 3 — Overpass breach | Final wave — Central plaza siege | Extraction
HORDE ENTRY LANES: H1 North West (West Block) | H2 North (Central Road) | H3 South West (Park Entrance) | H4 South East (Bus Depot)
KEY CHOKEPOINTS: CP1 North Alley (between West Block & Plaza) | CP2 Central Bridge (plaza entrance) | CP3 South Gate (between Park & Bus Depot)
FOOTER: SURVIVE / COLLECT / EXTRACT

CAMERA AND VIEW MODES
1. TACTICAL 2D (default): orthographic top-down camera, north up, matches the poster composition. Pan (drag / WASD / arrows), zoom (wheel / pinch / +/-), zoom limits 0.6x–6x, smooth damping, double-click to focus.
2. 3D RECON: perspective orbit camera (OrbitControls) with polar-angle limits, buildings extruded with facades, shadows, vegetation volumes, rotating objective holograms. Toggle with button or key T; animate the transition between the two cameras (900 ms ease in-out; instant if reduced motion).
3. FOCUS shortcuts: clickable chips and list items fly the camera to any Spawn, Objective, Horde Entry, Chokepoint or Building with a short cinematic move.
4. MINIMAP (bottom-right of the viewport): live overview with viewport rectangle; click to jump.

INTERACTIVITY — MUST-HAVE FEATURES
1. HOVER / CLICK INFO CARDS for every marker, building, zone and route: ID, name, type, world coordinates (m), plain-language description from the design intent, linked waves, linked routes, and distances to S1 and S2 along the nav graph. Cards are accessible (focusable, Esc to close) and never leave the viewport.
2. LAYER MANAGER via the legend rows, plus "Solo layer" (Alt+click) and "Reset layers".
3. WAVE SIMULATOR with a bottom timeline: Wave 1, Wave 2, Wave 3, Final, Extraction. Controls: Play/Pause, Step, Speed 0.5x/1x/2x/4x, scrubber, loop. Each wave drives instanced horde agents entering from the lanes below and following the nav graph to their target. Agent movement: 2.2–3.4 m/s with lateral jitter and soft separation; max 400 agents. Counts are visualization density, not gameplay tuning, and must be editable in data.js.
   - Wave 1 Perimeter pressure: 15 agents each from H1–H4 (60), flowing along perimeter/flank routes toward the players' side of the map.
   - Wave 2 Alley push: 80 agents from H1 and H2, funneling through CP1 North Alley into the plaza north edge.
   - Wave 3 Overpass breach: 100 agents from H2 and H3, converging on the CP2 Central Bridge and pushing across it.
   - Final wave Central plaza siege: 160 agents from all four entries converging on OBJ1 Central Plaza.
   - Extraction: 80 agents from H3 and H4 funneling through CP3 South Gate toward the Bus Depot and the extraction pad.
   (These wave targets are the designer's interpretation of the poster's wave labels; keep them configurable.)
4. HEATMAP overlay: accumulates agent presence into a canvas texture on the ground, red-to-yellow gradient with decay; toggle "Horde Pressure Heatmap". It must visibly confirm that chokepoints and the plaza are the high-pressure areas.
5. MISSION PLAYBACK ("Run Mission" button): two cyan player avatars (P1, P2) walk their routes (S1→OBJ1 and S2→OBJ1, together to OBJ2, OBJ3, then Extraction) with the wave simulator synced. Objective checklist in the OBJECTIVES panel ticks live (0/3 → 3/3), the Extraction pad unlocks only at 3/3 with a green burst and "EXTRACTION OPEN" banner, and the run ends with a "MISSION COMPLETE" summary (time, distance per player). Also allow manual play: click a Data Drive to "collect" it; the same logic applies.
6. FAIRNESS & PACING ANALYZER (panel in the right column): build a navigation graph from all route waypoints plus markers (nodes linked consecutively and by proximity under 10 m; weights = meters). Use Dijkstra. Show a table of shortest-path distances S1 and S2 to OBJ1, OBJ2, OBJ3, Extraction, plus the difference in meters and percent, a bar visualization, and a verdict chip (BALANCED within ±15 %, SKEWED beyond). Clicking a row draws the actual path in the scene. Add a "chokepoint exposure" figure: how many of the shortest paths pass through each CP.
7. CO-OP PING SYSTEM: Shift+click places a numbered ping (cyan for P1, yellow for P2, toggle with key P); right-click removes it. Pings persist in memory during the session and can be exported to JSON.
8. MEASURE TOOL (key M): click two points to measure straight-line and nav-graph distance in meters; shows a labeled line.
9. SIGHTLINE PROBE (key V): click a point; draw a 2D visibility polygon from that point against building footprints (ray casting every 1.5 degrees, 80 m range) to reveal cover and exposure, especially around the plaza.
10. GUIDED TOUR ("Design Intent Tour" button): 7 steps with camera moves, each highlighting one intent bullet (co-op spawns, three lanes, rotating horde pressure, exposed central objective, powerful-but-risky chokepoints, flank routes, extraction). Next/Prev/Exit, keyboard accessible.
11. SCREENSHOT button: renders the current view at 2x to a PNG download (name: dead-city-map-YYYYMMDD-HHMM.png).
12. DEBUG MODE (?debug=1): draws the nav graph, node IDs, agent targets, collision boxes, and shows FPS, draw calls, triangles and agent count.

KEYBOARD SHORTCUTS (show in a "?" help modal)
T 2D/3D | 1–5 jump to wave | Space play/pause | L layers | M measure | V sightline | P ping owner | F focus selection | H help | G tour | Esc close/clear | arrows/WASD pan | +/- zoom | R reset camera

ASSET HANDLING
- Texture loading with THREE.TextureLoader; color textures use SRGBColorSpace; set anisotropy to the renderer maximum; roads/grass/pavers use RepeatWrapping with MirroredRepeatWrapping for the second sample to hide tiling seams; add low-frequency world-space noise tint to break repetition.
- Sprites and icons (spr_* and icon_*) come with a flat #FF00FF background. Implement a utility chromaKey(image, {key:'#FF00FF', tolerance: 60, feather: 12}) that draws to an offscreen canvas, removes magenta with soft-edge feathering AND de-spills magenta fringe pixels, and returns a transparent CanvasTexture. Cache results.
- hero_ground_plate.png, when present, is mapped across the full 300x330 m ground as the base albedo in both views (letterbox-safe: crop to 300:330 aspect via UV mapping). Streets/zones overlays render on top.
- Provide the full ASSET MANIFEST as a constant in data.js, with fallback generators for each entry.

ASSET MANIFEST (filenames)
hero_ground_plate.png | tex_asphalt.png tex_plaza_pavers.png tex_grass_overgrown.png tex_dirt_rubble.png tex_sidewalk.png tex_extraction_lawn.png | roof_west_block.png roof_office_block.png roof_east_towers.png roof_metro_district.png roof_bus_depot.png roof_generic_01.png roof_generic_02.png roof_generic_03.png | facade_residential.png facade_office_glass.png facade_tower_concrete.png facade_metro_tile.png | spr_tree_01.png spr_tree_02.png spr_tree_03.png spr_bush_cluster.png spr_rubble_01.png spr_rubble_02.png spr_car_wreck_01.png spr_car_wreck_02.png spr_car_wreck_03.png spr_bus_wreck.png spr_barricade_sandbag.png spr_barricade_concrete.png spr_supply_crate.png spr_fountain.png spr_horde_cluster.png | icon_player_spawn.png icon_data_drive.png icon_horde_entry.png icon_chokepoint.png icon_supply.png icon_vehicle.png icon_extraction.png | logo_dead_city.png

CODE QUALITY BAR
- Modular ES modules with clear responsibilities (data / renderer / world / overlays / sim / ui / main). JSDoc on public functions. No globals except a single namespaced app state object. Use an event bus for UI<->scene communication.
- Deterministic seeded RNG (mulberry32) for all procedural placement.
- Robust input handling (pointer events), resize handling (ResizeObserver), and context-loss recovery.
- Accessibility: semantic HTML, ARIA labels on all controls, visible focus rings, color-blind-safe mode (toggle) that adds shape coding and patterns in addition to color, WCAG AA contrast on text.
- README.md: project structure, how to run, how to edit data.js (add a marker, change wave counts, move a chokepoint), how to swap assets, performance tips, known limitations.

ACCEPTANCE CHECKLIST (verify mentally before answering, and fix anything that fails)
[ ] Opens straight into a polished 2D tactical view that clearly matches the poster's layout, labels and icon positions.
[ ] 3D toggle works with buildings, shadows and the raised Central Bridge.
[ ] All 4 horde entries, 3 chokepoints, 3 objectives, 2 spawns, extraction, zones and all route types are visible and togglable.
[ ] Wave simulator plays all 5 stages with believable funneling and a live heatmap.
[ ] Mission playback completes with 3/3 drives and unlocks extraction.
[ ] Fairness analyzer shows S1 vs S2 distances with verdicts and path preview.
[ ] Works with zero assets (procedural fallbacks) and with all assets.
[ ] No console errors, no placeholders, no truncated files, 60 fps feel.

Begin now. Output the files in the specified order.
````

---

# PART C — FOLLOW-UP / ITERATION PROMPTS

**C1. Continue after a cut-off**
````
Continue from <PATH YOU WERE ON>. Output that file in full, then every remaining file in the agreed order. No summaries, no placeholders, no repeated files.
````

**C2. Visual polish pass**
````
Do a visual polish pass without changing architecture. Improve: (1) building silhouettes and roof prop density, (2) route line glow and arrowhead readability at far zoom, (3) label collision handling, (4) bloom intensity on objective beacons at NIGHT, (5) panel typography spacing to match the poster. Return ONLY the files you changed, complete, each with a one-line changelog.
````

**C3. Performance pass**
````
Profile mentally and optimize for integrated GPUs: reduce draw calls (merge static building meshes by material, use InstancedMesh everywhere possible), clamp shadow map size to 2048 with a tight light frustum, add adaptive resolution (drop DPR when frame time exceeds 20 ms for 2 s, restore when it drops under 14 ms), throttle heatmap canvas updates to 15 Hz, and add object pooling for ping/measure labels. Return only changed files, complete.
````

**C4. Bug-fix template**
````
Bug report. Steps: <what I did>. Expected: <what should happen>. Actual: <what happened, plus any console error text>. Find the root cause, explain it in two sentences, then return ONLY the corrected files in full.
````

**C5. Balance iteration**
````
Using the Fairness & Pacing Analyzer logic, propose three concrete layout adjustments (marker moves, added flank routes, supply cache moves) that bring the S1 and S2 distance deltas to within 10 % WITHOUT changing the objective locations. Apply the best one in data.js, explain the numbers before and after, and return the changed files in full.
````

---

# 5. DESIGNER'S NOTES

**Assumptions made while reading the poster**
- Scale derived from the 100 m scale bar: the playable area is roughly 300 x 330 m.
- Wave 3 is labeled "Overpass breach" while the chokepoint list names the "Central Bridge". They are treated as the same structure (raised crossing at CP2).
- The poster says extraction is "at the Bus Depot" but draws the pad just east of the depot; it is modeled as an adjacent pad inside the safe zone.
- Wave 5 ("Extraction") has no stated enemy behavior on the poster; the prompt routes pressure through H3/H4 and CP3 toward the depot. It is configurable.
- Horde counts, supply cache positions in the Park and several minor-building footprints are designer estimates for visualization.

**Balance observation worth testing (rough straight-line numbers)**
Spawn 1 and Spawn 2 are symmetric to Data Drive 1 (about 132 m vs 134 m), but Spawn 2 is much closer to Data Drive 2 (about 95 m vs 222 m) and Data Drive 3 (about 199 m vs 248 m). In co-op this is a pacing issue rather than a fairness issue, since Player 1 will spend longer exposed on the long routes. The Fairness Analyzer in the build will quantify it, and prompt C5 is ready if you want to rebalance (for example with an added west-side shortcut or extra supply caches along the south-west lane).
