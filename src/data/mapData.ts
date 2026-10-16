export interface Point2D {
  x: number;
  z: number;
}

export interface SpawnPoint {
  id: string;
  name: string;
  code: string;
  x: number;
  z: number;
  facing: 'east' | 'west' | 'north' | 'south';
  desc: string;
}

export interface ObjectivePoint {
  id: string;
  code: string;
  name: string;
  x: number;
  z: number;
  propPos?: Point2D;
  desc: string;
  locationDetails: string;
  required: boolean;
}

export interface HordeEntry {
  id: string;
  code: string;
  name: string;
  x: number;
  z: number;
  heading: 'south' | 'north' | 'east' | 'west';
  desc: string;
  targetChokepoint: string;
}

export interface Chokepoint {
  id: string;
  code: string;
  name: string;
  x: number;
  z: number;
  radius: number;
  desc: string;
  riskFactor: 'High' | 'Extreme' | 'Critical';
}

export interface Zone {
  id: string;
  name: string;
  type: 'contested' | 'safe' | 'extraction';
  bounds: { x0: number; z0: number; x1: number; z1: number };
  desc: string;
  color: string;
}

export interface Building {
  id: string;
  code?: string;
  name: string;
  footprint: [number, number, number, number]; // [x0, z0, x1, z1]
  height: number;
  type: 'major' | 'minor' | 'ruin';
  desc: string;
  subStructures?: { footprint: [number, number, number, number]; height: number }[];
}

export interface Route {
  id: string;
  name: string;
  type: 'player' | 'flank' | 'extraction';
  color: string;
  points: [number, number][];
  desc: string;
}

export interface WaveConfig {
  id: number;
  name: string;
  subtitle: string;
  totalAgents: number;
  description: string;
  entries: { entryId: string; count: number; target: { x: number; z: number }; viaCp?: string }[];
}

export const MAP_DIMENSIONS = {
  width: 300,  // X (meters)
  depth: 330,  // Z (meters)
};

export const SPAWNS: SpawnPoint[] = [
  {
    id: 's1',
    code: 'S1',
    name: 'Spawn 1',
    x: 18,
    z: 99,
    facing: 'east',
    desc: 'Located west of West Block. Features direct access to North Alley and southern flank routes.'
  },
  {
    id: 's2',
    code: 'S2',
    name: 'Spawn 2',
    x: 284,
    z: 99,
    facing: 'west',
    desc: 'Located east near East Towers and Metro District entrance. Direct sightline toward Central Plaza.'
  }
];

export const OBJECTIVES: ObjectivePoint[] = [
  {
    id: 'obj1',
    code: 'OBJ1',
    name: 'Data Drive 1 — Central Plaza',
    x: 150,
    z: 99,
    propPos: { x: 150, z: 138 },
    desc: 'Exposed encrypted military terminal near the dry fountain in the central plaza.',
    locationDetails: 'Wide open engagement zone with 360-degree vulnerability.',
    required: true
  },
  {
    id: 'obj2',
    code: 'OBJ2',
    name: 'Data Drive 2 — Metro District',
    x: 227,
    z: 175,
    propPos: { x: 227, z: 126 },
    desc: 'Emergency backup server rack inside the subterranean metro station hall.',
    locationDetails: 'Confined interior chokepoints and limited escape corridors.',
    required: true
  },
  {
    id: 'obj3',
    code: 'OBJ3',
    name: 'Data Drive 3 — Bus Depot',
    x: 192,
    z: 276,
    desc: 'Transit control telemetry mainframe inside the depot repair bay office.',
    locationDetails: 'Immediate staging ground adjacent to the final Extraction LZ.',
    required: true
  }
];

export const EXTRACTION_PAD = {
  id: 'ext_pad',
  code: 'LZ',
  name: 'Extraction Point (Lawn Pad)',
  bounds: { x0: 243, z0: 251, x1: 286, z1: 300 },
  center: { x: 262, z: 279 },
  desc: 'Reinforced helicopter and rescue vehicle extraction pad on the lawn east of Bus Depot. LOCKED until all 3 Data Drives are secured.'
};

export const HORDE_ENTRIES: HordeEntry[] = [
  {
    id: 'h1',
    code: 'H1',
    name: 'North West (West Block)',
    x: 69,
    z: 7,
    heading: 'south',
    desc: 'Highway breach funnels swarms through the alleyways beside West Block.',
    targetChokepoint: 'cp1'
  },
  {
    id: 'h2',
    code: 'H2',
    name: 'North (Central Road)',
    x: 204,
    z: 10,
    heading: 'south',
    desc: 'Main highway overpass funneling massive hordes straight down the central corridor.',
    targetChokepoint: 'cp1'
  },
  {
    id: 'h3',
    code: 'H3',
    name: 'South West (Park Entrance)',
    x: 136,
    z: 323,
    heading: 'north',
    desc: 'Overgrown ruins and drainage spillway allowing flanking infected waves.',
    targetChokepoint: 'cp3'
  },
  {
    id: 'h4',
    code: 'H4',
    name: 'South East (Bus Depot)',
    x: 234,
    z: 323,
    heading: 'north',
    desc: 'Industrial rail yard perimeter pressing directly into the Extraction staging area.',
    targetChokepoint: 'cp3'
  }
];

export const CHOKEPOINTS: Chokepoint[] = [
  {
    id: 'cp1',
    code: 'CP1',
    name: 'North Alley',
    x: 150,
    z: 78,
    radius: 14,
    desc: 'Narrow 12-meter alleyway separating West Block and Central Plaza. High tactical crossfire value.',
    riskFactor: 'High'
  },
  {
    id: 'cp2',
    code: 'CP2',
    name: 'Central Bridge',
    x: 150,
    z: 183,
    radius: 14,
    desc: 'Raised +3.5m overpass deck crossing the east-west avenue. Vital elevated vantage point but exposed to flankers.',
    riskFactor: 'Extreme'
  },
  {
    id: 'cp3',
    code: 'CP3',
    name: 'South Gate',
    x: 150,
    z: 268,
    radius: 14,
    desc: 'Heavy reinforced security bottleneck between Park Ruins and the Bus Depot compound.',
    riskFactor: 'Critical'
  }
];

export const ZONES: Zone[] = [
  {
    id: 'zone_plaza',
    name: 'Contested Zone (Central Plaza)',
    type: 'contested',
    bounds: { x0: 119, z0: 82, x1: 181, z1: 167 },
    desc: 'Central Plaza high-threat zone. Minimal hard cover, exposed to converging hordes.',
    color: '#E5202A'
  },
  {
    id: 'zone_depot',
    name: 'Safe Zone (Bus Depot Compound)',
    type: 'safe',
    bounds: { x0: 159, z0: 221, x1: 226, z1: 308 },
    desc: 'Fortified terminal with sandbags, corrugated walls, and defensible vehicle bays.',
    color: '#2ECC40'
  },
  {
    id: 'zone_extraction',
    name: 'Extraction Zone (Mowed Lawn Pad)',
    type: 'extraction',
    bounds: { x0: 243, z0: 251, x1: 286, z1: 300 },
    desc: 'Designated air-evac pad. Must be defended for 45 seconds during final exfil.',
    color: '#1EAEEF'
  }
];

export const BUILDINGS: Building[] = [
  {
    id: 'b_a',
    code: 'A',
    name: 'West Block',
    footprint: [39, 28, 103, 92],
    height: 24,
    type: 'major',
    desc: 'Mid-rise residential apartment block with multiple stairwells and rooftop AC units.'
  },
  {
    id: 'b_b',
    code: 'B',
    name: 'Office Block',
    footprint: [63, 112, 108, 168],
    height: 22,
    type: 'major',
    desc: 'Curtain-wall corporate headquarters providing heavy line-of-sight obstruction along western road.'
  },
  {
    id: 'b_c',
    code: 'C',
    name: 'East Towers',
    footprint: [192, 35, 256, 104],
    height: 38,
    type: 'major',
    desc: 'Twin brutalist corporate skyscrapers joined by a common podium structure (podium h: 8m).',
    subStructures: [
      { footprint: [192, 35, 222, 104], height: 38 },
      { footprint: [228, 35, 256, 104], height: 30 },
      { footprint: [192, 35, 256, 104], height: 8 }
    ]
  },
  {
    id: 'b_d',
    code: 'D',
    name: 'Metro District',
    footprint: [200, 126, 254, 200],
    height: 18,
    type: 'major',
    desc: 'Transit hub building with sunken ticket hall, large skylights, and transit platform tunnels.'
  },
  {
    id: 'b_e',
    code: 'E',
    name: 'Park / Ruins',
    footprint: [35, 193, 134, 296],
    height: 6,
    type: 'major',
    desc: 'Dense overgrown urban parkland containing 4 shattered concrete pavilion ruins.',
    subStructures: [
      { footprint: [50, 207, 70, 228], height: 6 },
      { footprint: [36, 270, 60, 290], height: 4 },
      { footprint: [121, 235, 130, 262], height: 8 },
      { footprint: [68, 200, 80, 212], height: 5 }
    ]
  },
  {
    id: 'b_f',
    code: 'F',
    name: 'Bus Depot',
    footprint: [172, 230, 219, 272],
    height: 9,
    type: 'major',
    desc: 'Industrial depot terminal with corrugated steel roof and covered repair bays open to the south.'
  },
  // Minor buildings
  { id: 'mb_1', name: 'Commercial Annex', footprint: [131, 28, 145, 58], height: 30, type: 'minor', desc: 'Narrow high-rise facade unit.' },
  { id: 'mb_2', name: 'Power Substation', footprint: [177, 42, 184, 58], height: 8, type: 'minor', desc: 'Utility electrical building.' },
  { id: 'mb_3', name: 'East Gatehouse', footprint: [264, 35, 278, 60], height: 20, type: 'minor', desc: 'Security watch and administration.' },
  { id: 'mb_4', name: 'Plaza Cafe', footprint: [47, 106, 60, 126], height: 10, type: 'minor', desc: 'Single-story diner with service alley.' },
  { id: 'mb_5', name: 'Maintenance Garage', footprint: [45, 151, 59, 170], height: 8, type: 'minor', desc: 'Mechanic shop and tool storage.' },
  { id: 'mb_6', name: 'Bridge Pumphouse West', footprint: [131, 190, 142, 205], height: 8, type: 'minor', desc: 'Overpass support utility building.' },
  { id: 'mb_7', name: 'Bridge Pumphouse East', footprint: [164, 190, 176, 205], height: 8, type: 'minor', desc: 'Overpass support utility building.' },
  { id: 'mb_8', name: 'Transit Control Kiosk', footprint: [264, 125, 278, 145], height: 12, type: 'minor', desc: 'Metro ventilation shaft building.' }
];

export const STREETS = [
  { name: 'Central Avenue', rect: [140, 0, 160, 330] },
  { name: 'Cross Street', rect: [0, 176, 300, 192] },
  { name: 'North Lane', rect: [39, 94, 256, 110] },
  { name: 'East Side Street', rect: [227, 190, 241, 330] }
];

export const SUPPLY_CACHES: Point2D[] = [
  { x: 125, z: 89 },
  { x: 175, z: 89 },
  { x: 124, z: 142 },
  { x: 186, z: 141 },
  { x: 206, z: 120 },
  { x: 65, z: 187 },
  { x: 199, z: 219 },
  { x: 272, z: 228 },
  { x: 95, z: 255 },
  { x: 150, z: 290 }
];

export const VEHICLES = {
  buses: [
    { x: 195, z: 250, rot: 0.15 },
    { x: 205, z: 262, rot: -0.2 }
  ],
  cars: [
    { x: 146, z: 45, rot: 0.4 },
    { x: 154, z: 70, rot: -0.1 },
    { x: 148, z: 120, rot: 0.8 },
    { x: 155, z: 160, rot: -0.3 },
    { x: 147, z: 220, rot: 0.2 },
    { x: 153, z: 245, rot: 0.9 },
    { x: 90, z: 184, rot: 0.05 },
    { x: 120, z: 184, rot: -0.4 },
    { x: 200, z: 184, rot: 0.15 },
    { x: 240, z: 184, rot: -0.25 }
  ]
};

export const ROUTES: Route[] = [
  // Player Routes (Cyan)
  {
    id: 'pr1',
    name: 'PR1: Spawn 1 to Data Drive 1',
    type: 'player',
    color: '#1EAEEF',
    points: [[18, 99], [44, 99], [102, 99], [126, 99], [150, 99]],
    desc: 'Primary northern approach from West Block to the Central Plaza fountain.'
  },
  {
    id: 'pr2',
    name: 'PR2: Spawn 2 to Data Drive 1',
    type: 'player',
    color: '#1EAEEF',
    points: [[284, 99], [275, 115], [243, 115], [207, 115], [181, 108], [150, 99]],
    desc: 'Primary eastern avenue approach from East Towers into Central Plaza.'
  },
  {
    id: 'pr3',
    name: 'PR3: Data Drive 1 to Data Drive 2',
    type: 'player',
    color: '#1EAEEF',
    points: [[150, 99], [181, 120], [207, 120], [227, 122], [227, 130], [227, 175]],
    desc: 'Transit corridor linking Central Plaza to Metro District entrance.'
  },
  {
    id: 'pr4',
    name: 'PR4: Data Drive 2 to Data Drive 3',
    type: 'player',
    color: '#1EAEEF',
    points: [[227, 175], [234, 200], [234, 240], [205, 270], [192, 276]],
    desc: 'East street connection descending south into the Bus Depot staging bay.'
  },
  {
    id: 'pr5',
    name: 'PR5: Data Drive 3 to Extraction Pad',
    type: 'player',
    color: '#1EAEEF',
    points: [[192, 276], [222, 282], [262, 279]],
    desc: 'Final escape run from Bus Depot workshop onto the extraction lawn.'
  },
  {
    id: 'pr6',
    name: 'PR6: S1 South Lane to Bus Depot',
    type: 'player',
    color: '#1EAEEF',
    points: [[18, 99], [21, 123], [42, 187], [108, 191], [150, 183], [150, 215], [150, 268], [172, 276], [192, 276]],
    desc: 'Direct southern highway circumventing the central plaza under Central Bridge.'
  },

  // Flank Routes (Yellow)
  {
    id: 'fl1',
    name: 'FL1: West–North Flank',
    type: 'flank',
    color: '#FFD21F',
    points: [[21, 123], [30, 100], [44, 97], [102, 97], [108, 89], [150, 78], [181, 78]],
    desc: 'Rooftop and alley catwalks bypassing North Alley choke.'
  },
  {
    id: 'fl2',
    name: 'FL2: West–South–East Grand Loop',
    type: 'flank',
    color: '#FFD21F',
    points: [[21, 123], [21, 170], [42, 187], [108, 191], [129, 187], [150, 183], [172, 187], [189, 206], [200, 213], [252, 213], [266, 198], [275, 187], [275, 125]],
    desc: 'Wide lateral perimeter loop enabling teams to circle enemy hordes.'
  },
  {
    id: 'fl3',
    name: 'FL3: East–North Flank',
    type: 'flank',
    color: '#FFD21F',
    points: [[273, 78], [262, 86], [243, 112], [207, 113], [181, 110]],
    desc: 'Behind East Towers service lane providing safe withdrawal.'
  },
  {
    id: 'fl4',
    name: 'FL4: South-West Park Loop',
    type: 'flank',
    color: '#FFD21F',
    points: [[150, 268], [136, 285], [136, 297], [100, 298], [67, 298], [40, 260], [30, 215], [42, 187]],
    desc: 'Covert tree canopy trail around Park Ruins avoiding open road line-of-fire.'
  },

  // Extraction Routes (Green)
  {
    id: 'er1',
    name: 'ER1: Tactical Evac Perimeter Run',
    type: 'extraction',
    color: '#2ECC40',
    points: [[192, 276], [165, 276], [165, 303], [225, 303], [262, 290], [262, 279]],
    desc: 'Covered southern perimeter approach around the fuel depots.'
  },
  {
    id: 'er2',
    name: 'ER2: Extraction Support Lane',
    type: 'extraction',
    color: '#2ECC40',
    points: [[234, 318], [234, 260], [234, 215]],
    desc: 'Rear security corridor securing the east LZ boundary.'
  }
];

export const WAVES: WaveConfig[] = [
  {
    id: 1,
    name: 'Wave 1',
    subtitle: 'Perimeter Pressure',
    totalAgents: 60,
    description: 'Initial scouting wave testing perimeter lines across all four entry points.',
    entries: [
      { entryId: 'h1', count: 15, target: { x: 50, z: 80 } },
      { entryId: 'h2', count: 15, target: { x: 230, z: 90 } },
      { entryId: 'h3', count: 15, target: { x: 100, z: 240 } },
      { entryId: 'h4', count: 15, target: { x: 220, z: 260 } }
    ]
  },
  {
    id: 2,
    name: 'Wave 2',
    subtitle: 'Alley Push',
    totalAgents: 80,
    description: 'High-density horde surge concentrating through CP1 North Alley into Central Plaza.',
    entries: [
      { entryId: 'h1', count: 40, target: { x: 150, z: 99 }, viaCp: 'cp1' },
      { entryId: 'h2', count: 40, target: { x: 150, z: 99 }, viaCp: 'cp1' }
    ]
  },
  {
    id: 3,
    name: 'Wave 3',
    subtitle: 'Overpass Breach',
    totalAgents: 100,
    description: 'Bifurcated assault attempting to storm across the elevated Central Bridge overpass.',
    entries: [
      { entryId: 'h2', count: 50, target: { x: 150, z: 183 }, viaCp: 'cp2' },
      { entryId: 'h3', count: 50, target: { x: 150, z: 183 }, viaCp: 'cp2' }
    ]
  },
  {
    id: 4,
    name: 'Final Wave',
    subtitle: 'Central Plaza Siege',
    totalAgents: 160,
    description: 'Massive all-front invasion converging on OBJ1 Central Plaza. Maximum tactical chaos.',
    entries: [
      { entryId: 'h1', count: 40, target: { x: 150, z: 99 } },
      { entryId: 'h2', count: 40, target: { x: 150, z: 99 } },
      { entryId: 'h3', count: 40, target: { x: 150, z: 99 } },
      { entryId: 'h4', count: 40, target: { x: 150, z: 99 } }
    ]
  },
  {
    id: 5,
    name: 'Extraction',
    subtitle: 'Evacuation Lockdown',
    totalAgents: 80,
    description: 'Final desperate assault from the south pushing through South Gate to overwhelm the LZ pad.',
    entries: [
      { entryId: 'h3', count: 40, target: { x: 262, z: 279 }, viaCp: 'cp3' },
      { entryId: 'h4', count: 40, target: { x: 262, z: 279 } }
    ]
  }
];

export const PANEL_COPY = {
  shortExplanation: [
    {
      q: '1. What is the game mode of your map?',
      a: 'The game mode is Horde Mode, where players work together to survive waves of enemies in an abandoned city.'
    },
    {
      q: '2. Where do the players spawn?',
      a: 'Players spawn at two locations: Spawn 1 near the West Block and Spawn 2 near the East Towers and Metro Entrance.'
    },
    {
      q: '3. What is the main objective?',
      a: 'The main objective is to collect key items and complete the required tasks to reach the extraction point and escape the city.'
    },
    {
      q: '4. Where is the chokepoint?',
      a: 'The main chokepoints are the North Alley near the West Block, the Central Bridge near the plaza, and the South Gate between the Park and Bus Depot. These narrow areas make it harder for enemies to pass through.'
    },
    {
      q: '5. How did you make the map fair and balanced?',
      a: 'I made the map fair by providing two spawn points, multiple routes, cover, and supply locations. Both players can reach the objectives, while the different paths give them options to avoid enemies or defend important areas together.'
    }
  ],
  designIntent: [
    { title: '2-Player Co-op Balance', desc: 'Symmetrical starting opportunities with coordinated converging objectives.' },
    { title: '3 Main Tactical Lanes', desc: 'North alley, Central elevated overpass, and South industrial bypass.' },
    { title: 'Rotating Horde Pressure', desc: 'Predictable wave funnels that test team positioning and defense prep.' },
    { title: 'Exposed Central Objective', desc: 'High-risk high-reward plaza terminal demanding 360-degree perimeter discipline.' },
    { title: 'Risk-Reward Chokepoints', desc: 'Concentrated kill zones with devastating back-alley flanking vulnerabilities.' },
    { title: 'Anti-Camping Flanks', desc: 'Park canopy trails and side catwalks keeping player movement dynamic.' }
  ]
};
