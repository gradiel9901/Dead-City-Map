import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  MAP_DIMENSIONS,
  SPAWNS,
  OBJECTIVES,
  EXTRACTION_PAD,
  HORDE_ENTRIES,
  CHOKEPOINTS,
  ZONES,
  BUILDINGS,
  STREETS,
  SUPPLY_CACHES,
  VEHICLES,
  ROUTES,
  Route,
  WaveConfig
} from '../data/mapData';
import { getProceduralTexture } from '../utils/proceduralTextures';
import { navGraph, PathResult } from '../utils/navGraph';
import { computeSightlinePolygon } from '../utils/sightline';

export interface PingData {
  id: string;
  number: number;
  owner: 'P1' | 'P2';
  x: number;
  z: number;
  timestamp: string;
}

export interface MeasurePoint {
  x: number;
  z: number;
}

interface TacticalMapCanvasProps {
  viewMode: '2D' | '3D';
  timeOfDay: 'DUSK' | 'NIGHT' | 'DAY';
  colorBlindMode: boolean;
  layers: Record<string, boolean>;
  activeWave: WaveConfig | null;
  isSimPlaying: boolean;
  simSpeed: number;
  simTime: number;
  showHeatmap: boolean;
  activeTool: 'none' | 'measure' | 'sightline';
  pingOwner: 'P1' | 'P2';
  pings: PingData[];
  onAddPing: (ping: PingData) => void;
  onRemovePing: (id: string) => void;
  onSelectEntity: (entity: any) => void;
  onHoverEntity: (entity: any | null) => void;
  highlightedPath: [number, number][] | null;
  focusTarget: { x: number; z: number } | null;
  collectedDrivesCount: number;
  isMissionPlaying: boolean;
  missionProgress: number; // 0 to 1
  onDriveCollected?: (index: number) => void;
}

export const TacticalMapCanvas: React.FC<TacticalMapCanvasProps> = ({
  viewMode,
  timeOfDay,
  colorBlindMode,
  layers,
  activeWave,
  isSimPlaying,
  simSpeed,
  simTime,
  showHeatmap,
  activeTool,
  pingOwner,
  pings,
  onAddPing,
  onRemovePing,
  onSelectEntity,
  onHoverEntity,
  highlightedPath,
  focusTarget,
  collectedDrivesCount,
  isMissionPlaying,
  missionProgress,
  onDriveCollected
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orthoCamRef = useRef<THREE.OrthographicCamera | null>(null);
  const perspCamRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Measure tool state
  const measurePointsRef = useRef<MeasurePoint[]>([]);
  const measureLineMeshRef = useRef<THREE.Line | null>(null);
  const sightlineMeshRef = useRef<THREE.Mesh | null>(null);
  const highlightedPathMeshRef = useRef<THREE.Line | null>(null);

  // Simulation agents state
  const agentsRef = useRef<{ x: number; z: number; vx: number; vz: number; tx: number; tz: number; active: boolean }[]>([]);
  const hordeInstancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const player1MeshRef = useRef<THREE.Mesh | null>(null);
  const player2MeshRef = useRef<THREE.Mesh | null>(null);
  const extractionBeamRef = useRef<THREE.Mesh | null>(null);

  // Heatmap offscreen canvas
  const heatmapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatmapTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const heatmapPlaneRef = useRef<THREE.Mesh | null>(null);

  // Transition state
  const transitionRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    fromMode: '2D' | '3D';
    toMode: '2D' | '3D';
  }>({ active: false, startTime: 0, duration: 900, fromMode: '2D', toMode: '2D' });

  // 1. Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B1424');
    scene.fog = new THREE.FogExp2('#0B1424', 0.002);
    sceneRef.current = scene;

    // Orthographic Camera for 2D Tactical View
    const aspect = width / height;
    const frustumSize = 360;
    const orthoCam = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      1,
      2000
    );
    orthoCam.position.set(MAP_DIMENSIONS.width / 2, 400, MAP_DIMENSIONS.depth / 2);
    orthoCam.lookAt(MAP_DIMENSIONS.width / 2, 0, MAP_DIMENSIONS.depth / 2);
    orthoCamRef.current = orthoCam;

    // Perspective Camera for 3D Recon View
    const perspCam = new THREE.PerspectiveCamera(48, aspect, 1, 2000);
    perspCam.position.set(MAP_DIMENSIONS.width / 2, 280, MAP_DIMENSIONS.depth + 180);
    perspCam.lookAt(MAP_DIMENSIONS.width / 2, 0, MAP_DIMENSIONS.depth / 2);
    perspCamRef.current = perspCam;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls for 3D
    const controls = new OrbitControls(perspCam, renderer.domElement);
    controls.target.set(MAP_DIMENSIONS.width / 2, 0, MAP_DIMENSIONS.depth / 2);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.15; // prevent going below ground
    controls.minDistance = 40;
    controls.maxDistance = 600;
    controls.enabled = viewMode === '3D';
    controlsRef.current = controls;

    // Lighting
    const hemiLight = new THREE.HemisphereLight('#8FA3BC', '#0F1E33', 0.6);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight('#E8EEF6', 1.2);
    dirLight.position.set(-150, 300, -150); // North-West key light
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 50;
    dirLight.shadow.camera.far = 800;
    const shadowDist = 260;
    dirLight.shadow.camera.left = -shadowDist;
    dirLight.shadow.camera.right = shadowDist;
    dirLight.shadow.camera.top = shadowDist;
    dirLight.shadow.camera.bottom = -shadowDist;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 2. Build World Geometry
    buildTerrainAndStreets(scene);
    buildBuildings(scene);
    buildZones(scene);
    buildChokepoints(scene);
    buildMarkers(scene);
    buildRoutes(scene);
    buildVegetationAndDebris(scene);
    buildHeatmapPlane(scene);
    buildHordeAgents(scene);
    buildPlayers(scene);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const asp = w / h;

      if (orthoCamRef.current) {
        orthoCamRef.current.left = (-frustumSize * asp) / 2;
        orthoCamRef.current.right = (frustumSize * asp) / 2;
        orthoCamRef.current.top = frustumSize / 2;
        orthoCamRef.current.bottom = -frustumSize / 2;
        orthoCamRef.current.updateProjectionMatrix();
      }

      if (perspCamRef.current) {
        perspCamRef.current.aspect = asp;
        perspCamRef.current.updateProjectionMatrix();
      }

      rendererRef.current.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Controls update
      if (controlsRef.current && controlsRef.current.enabled) {
        controlsRef.current.update();
      }

      // Camera transition interpolation if active
      if (transitionRef.current.active) {
        const t = (performance.now() - transitionRef.current.startTime) / transitionRef.current.duration;
        if (t >= 1) {
          transitionRef.current.active = false;
        }
      }

      // Route animated dashes shader update
      scene.traverse((obj) => {
        if (obj instanceof THREE.Line && (obj.material as any).userData?.isFlowMaterial) {
          const mat = obj.material as THREE.LineDashedMaterial;
          // Animate dash offset via texture or uniform if applicable
          mat.dashSize = 4;
          mat.gapSize = 3;
        }
      });

      // Animate Chokepoint cylinders and objective holograms
      scene.traverse((obj) => {
        if (obj.name.startsWith('chokepoint_cylinder_')) {
          obj.rotation.y += delta * 0.8;
          const s = 1 + 0.08 * Math.sin(elapsed * 3);
          obj.scale.set(s, 1, s);
        }
        if (obj.name.startsWith('obj_hologram_')) {
          obj.rotation.y += delta * 1.5;
          obj.position.y = 8 + Math.sin(elapsed * 2.5) * 1.2;
        }
        if (obj.name === 'extraction_beam') {
          obj.rotation.y += delta * 0.5;
        }
      });

      // Update horde simulation
      updateHordeSim(delta);

      // Render with active camera
      const activeCam = viewMode === '2D' ? orthoCamRef.current : perspCamRef.current;
      if (rendererRef.current && sceneRef.current && activeCam) {
        rendererRef.current.render(sceneRef.current, activeCam);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (rendererRef.current && containerRef.current) {
        containerRef.current.innerHTML = '';
        rendererRef.current.dispose();
      }
    };
  }, []);

  // 2. View Mode Toggle
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = viewMode === '3D';
    }
  }, [viewMode]);

  // 3. Time of Day Presets
  useEffect(() => {
    if (!dirLightRef.current || !hemiLightRef.current || !sceneRef.current) return;
    if (timeOfDay === 'DUSK') {
      sceneRef.current.background = new THREE.Color('#0B1424');
      sceneRef.current.fog = new THREE.FogExp2('#0B1424', 0.002);
      dirLightRef.current.color = new THREE.Color('#FFB885');
      dirLightRef.current.intensity = 1.3;
      hemiLightRef.current.color = new THREE.Color('#6E8AA8');
      hemiLightRef.current.groundColor = new THREE.Color('#0B1424');
      hemiLightRef.current.intensity = 0.5;
    } else if (timeOfDay === 'NIGHT') {
      sceneRef.current.background = new THREE.Color('#040810');
      sceneRef.current.fog = new THREE.FogExp2('#040810', 0.0035);
      dirLightRef.current.color = new THREE.Color('#385785');
      dirLightRef.current.intensity = 0.4;
      hemiLightRef.current.color = new THREE.Color('#1F324D');
      hemiLightRef.current.groundColor = new THREE.Color('#03060C');
      hemiLightRef.current.intensity = 0.25;
    } else {
      // OVERCAST DAY
      sceneRef.current.background = new THREE.Color('#162030');
      sceneRef.current.fog = new THREE.FogExp2('#162030', 0.0015);
      dirLightRef.current.color = new THREE.Color('#DDE8F4');
      dirLightRef.current.intensity = 1.6;
      hemiLightRef.current.color = new THREE.Color('#8EABC7');
      hemiLightRef.current.groundColor = new THREE.Color('#1F2A3C');
      hemiLightRef.current.intensity = 0.8;
    }
  }, [timeOfDay]);

  // 4. Focus target changes
  useEffect(() => {
    if (!focusTarget) return;
    if (viewMode === '2D' && orthoCamRef.current) {
      orthoCamRef.current.position.x = focusTarget.x;
      orthoCamRef.current.position.z = focusTarget.z;
      orthoCamRef.current.lookAt(focusTarget.x, 0, focusTarget.z);
    } else if (viewMode === '3D' && controlsRef.current && perspCamRef.current) {
      controlsRef.current.target.set(focusTarget.x, 0, focusTarget.z);
      perspCamRef.current.position.set(focusTarget.x, 140, focusTarget.z + 140);
      controlsRef.current.update();
    }
  }, [focusTarget, viewMode]);

  // 5. Layer visibility updates
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    scene.traverse((child) => {
      const layer = child.userData?.layer;
      if (layer && layers[layer] !== undefined) {
        child.visible = layers[layer];
      }
    });
  }, [layers]);

  // 6. Highlighted Path Update (from Fairness Analyzer)
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (highlightedPathMeshRef.current) {
      scene.remove(highlightedPathMeshRef.current);
      highlightedPathMeshRef.current.geometry.dispose();
      highlightedPathMeshRef.current = null;
    }

    if (highlightedPath && highlightedPath.length >= 2) {
      const points = highlightedPath.map(([x, z]) => new THREE.Vector3(x, 1.8, z));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: '#FFD21F', linewidth: 4 });
      const line = new THREE.Line(geom, mat);
      line.renderOrder = 20;
      scene.add(line);
      highlightedPathMeshRef.current = line;
    }
  }, [highlightedPath]);

  // 7. Extraction Pad Unlock State
  useEffect(() => {
    if (!sceneRef.current) return;
    const unlocked = collectedDrivesCount >= 3;
    const beam = sceneRef.current.getObjectByName('extraction_beam') as THREE.Mesh;
    if (beam) {
      const mat = beam.material as THREE.MeshBasicMaterial;
      if (unlocked) {
        mat.color.set('#2ECC40');
        mat.opacity = 0.7;
      } else {
        mat.color.set('#E5202A');
        mat.opacity = 0.35;
      }
    }
  }, [collectedDrivesCount]);

  // 8. Mission Playback Avatars Update
  useEffect(() => {
    if (!player1MeshRef.current || !player2MeshRef.current) return;

    if (isMissionPlaying) {
      player1MeshRef.current.visible = true;
      player2MeshRef.current.visible = true;

      // P1 Path: S1 -> OBJ1 -> OBJ2 -> OBJ3 -> Ext
      // P2 Path: S2 -> OBJ1 -> OBJ2 -> OBJ3 -> Ext
      const p1Full = [
        ...ROUTES.find(r => r.id === 'pr1')!.points,
        ...ROUTES.find(r => r.id === 'pr3')!.points.slice(1),
        ...ROUTES.find(r => r.id === 'pr4')!.points.slice(1),
        ...ROUTES.find(r => r.id === 'pr5')!.points.slice(1)
      ];
      const p2Full = [
        ...ROUTES.find(r => r.id === 'pr2')!.points,
        ...ROUTES.find(r => r.id === 'pr3')!.points.slice(1),
        ...ROUTES.find(r => r.id === 'pr4')!.points.slice(1),
        ...ROUTES.find(r => r.id === 'pr5')!.points.slice(1)
      ];

      const p1Pos = interpolatePolyline(p1Full, missionProgress);
      const p2Pos = interpolatePolyline(p2Full, missionProgress);

      player1MeshRef.current.position.set(p1Pos.x, 2, p1Pos.z);
      player2MeshRef.current.position.set(p2Pos.x + 2, 2, p2Pos.z);
    } else {
      player1MeshRef.current.visible = true;
      player2MeshRef.current.visible = true;
      player1MeshRef.current.position.set(SPAWNS[0].x, 2, SPAWNS[0].z);
      player2MeshRef.current.position.set(SPAWNS[1].x, 2, SPAWNS[1].z);
    }
  }, [isMissionPlaying, missionProgress]);

  // 9. Horde wave initialization when activeWave changes
  useEffect(() => {
    if (!activeWave) {
      agentsRef.current = [];
      return;
    }
    const newAgents: { x: number; z: number; vx: number; vz: number; tx: number; tz: number; active: boolean }[] = [];
    activeWave.entries.forEach(entry => {
      const hordeEntry = HORDE_ENTRIES.find(h => h.id === entry.entryId);
      if (!hordeEntry) return;

      for (let i = 0; i < entry.count; i++) {
        // Lateral jitter offset at entry
        const jitterX = (Math.random() - 0.5) * 16;
        const jitterZ = (Math.random() - 0.5) * 16;
        newAgents.push({
          x: hordeEntry.x + jitterX,
          z: hordeEntry.z + jitterZ,
          vx: 0,
          vz: 0,
          tx: entry.target.x + (Math.random() - 0.5) * 12,
          tz: entry.target.z + (Math.random() - 0.5) * 12,
          active: true
        });
      }
    });
    agentsRef.current = newAgents;
  }, [activeWave]);

  // Update Horde Simulation Agents
  const updateHordeSim = (delta: number) => {
    if (!isSimPlaying || !activeWave || agentsRef.current.length === 0) return;
    const agents = agentsRef.current;
    const speed = (2.6 * simSpeed);

    // Heatmap decay & update throttling
    let drawHeatmap = showHeatmap && heatmapCanvasRef.current;
    let heatCtx: CanvasRenderingContext2D | null = null;
    if (drawHeatmap) {
      heatCtx = heatmapCanvasRef.current!.getContext('2d');
      if (heatCtx) {
        heatCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        heatCtx.fillRect(0, 0, 512, 512);
      }
    }

    const dummy = new THREE.Object3D();
    const mesh = hordeInstancedMeshRef.current;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      if (!a.active) continue;

      const dx = a.tx - a.x;
      const dz = a.tz - a.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 3) {
        // Move towards target with gentle jitter
        const nx = dx / dist;
        const nz = dz / dist;
        a.x += (nx + (Math.random() - 0.5) * 0.2) * speed * delta * 10;
        a.z += (nz + (Math.random() - 0.5) * 0.2) * speed * delta * 10;
      }

      // Update instanced mesh transform
      if (mesh) {
        dummy.position.set(a.x, 1.2, a.z);
        dummy.scale.set(1.4, 1.4, 1.4);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      // Draw onto heatmap texture
      if (drawHeatmap && heatCtx) {
        const u = (a.x / MAP_DIMENSIONS.width) * 512;
        const v = (a.z / MAP_DIMENSIONS.depth) * 512;
        const grad = heatCtx.createRadialGradient(u, v, 2, u, v, 14);
        grad.addColorStop(0, 'rgba(229, 32, 42, 0.45)');
        grad.addColorStop(0.5, 'rgba(255, 210, 31, 0.25)');
        grad.addColorStop(1, 'rgba(255, 210, 31, 0)');
        heatCtx.fillStyle = grad;
        heatCtx.beginPath();
        heatCtx.arc(u, v, 14, 0, Math.PI * 2);
        heatCtx.fill();
      }
    }

    if (mesh) {
      mesh.count = agents.length;
      mesh.instanceMatrix.needsUpdate = true;
    }

    if (drawHeatmap && heatmapTextureRef.current) {
      heatmapTextureRef.current.needsUpdate = true;
    }
  };

  // 10. Pointer Interactions (Click / Shift+Click / Measure / Sightline)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !rendererRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const activeCam = viewMode === '2D' ? orthoCamRef.current : perspCamRef.current;
    if (!activeCam || !sceneRef.current) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), activeCam);

    // Intersect ground plane (y = 0)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    const hitGround = raycaster.ray.intersectPlane(groundPlane, hitPoint);

    if (!hitGround) return;

    const worldX = Math.round(hitPoint.x);
    const worldZ = Math.round(hitPoint.z);

    // 1. Shift+Click Ping Placement
    if (e.shiftKey) {
      const newPing: PingData = {
        id: `ping_${Date.now()}`,
        number: pings.length + 1,
        owner: pingOwner,
        x: worldX,
        z: worldZ,
        timestamp: new Date().toLocaleTimeString()
      };
      onAddPing(newPing);
      return;
    }

    // 2. Measure Tool
    if (activeTool === 'measure') {
      const pts = measurePointsRef.current;
      if (pts.length === 0) {
        pts.push({ x: worldX, z: worldZ });
      } else {
        pts.push({ x: worldX, z: worldZ });
        // Draw measure line in scene
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(pts[0].x, 2, pts[0].z),
          new THREE.Vector3(pts[1].x, 2, pts[1].z)
        ]);
        const mat = new THREE.LineBasicMaterial({ color: '#FFD21F', linewidth: 3 });
        if (measureLineMeshRef.current) {
          sceneRef.current.remove(measureLineMeshRef.current);
        }
        const line = new THREE.Line(geom, mat);
        sceneRef.current.add(line);
        measureLineMeshRef.current = line;

        const directDist = Math.round(Math.hypot(pts[1].x - pts[0].x, pts[1].z - pts[0].z) * 10) / 10;
        onSelectEntity({
          type: 'measure',
          name: 'Distance Measurement',
          desc: `Straight line distance: ${directDist} m. Points: (${pts[0].x}, ${pts[0].z}) to (${pts[1].x}, ${pts[1].z}).`
        });
        measurePointsRef.current = [];
      }
      return;
    }

    // 3. Sightline Probe Tool
    if (activeTool === 'sightline') {
      const poly = computeSightlinePolygon({ x: worldX, z: worldZ }, 80);
      const shape = new THREE.Shape();
      if (poly.length > 0) {
        shape.moveTo(poly[0][0], poly[0][1]);
        for (let i = 1; i < poly.length; i++) {
          shape.lineTo(poly[i][0], poly[i][1]);
        }
        shape.closePath();
      }
      const geom = new THREE.ShapeGeometry(shape);
      geom.rotateX(Math.PI / 2); // lay flat on ground
      const mat = new THREE.MeshBasicMaterial({
        color: '#1EAEEF',
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide
      });

      if (sightlineMeshRef.current) {
        sceneRef.current.remove(sightlineMeshRef.current);
      }
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(0, 0.8, 0);
      sceneRef.current.add(mesh);
      sightlineMeshRef.current = mesh;

      onSelectEntity({
        type: 'sightline',
        name: 'Tactical Sightline Probe',
        desc: `Radial line-of-sight polygon (80m range) cast from (${worldX}, ${worldZ}). Reveals firing cones and blind spots.`
      });
      return;
    }

    // 4. Object Picking (Raycasting selectable meshes)
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    for (const hit of intersects) {
      if (hit.object.userData?.entity) {
        onSelectEntity(hit.object.userData.entity);
        return;
      }
    }

    // Clicked empty ground
    onSelectEntity(null);
  };

  // Helper geometry builders
  const buildTerrainAndStreets = (scene: THREE.Scene) => {
    // Ground Base
    const groundGeo = new THREE.PlaneGeometry(MAP_DIMENSIONS.width, MAP_DIMENSIONS.depth);
    groundGeo.rotateX(-Math.PI / 2);
    const groundTex = getProceduralTexture('hero_ground_plate');
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(MAP_DIMENSIONS.width / 2, 0, MAP_DIMENSIONS.depth / 2);
    ground.receiveShadow = true;
    ground.userData = { layer: 'streets' };
    scene.add(ground);

    // Streets Mesh Overlays
    const streetMat = new THREE.MeshStandardMaterial({
      color: '#131924',
      roughness: 0.9,
      polygonOffset: true,
      polygonOffsetFactor: -1
    });
    STREETS.forEach(s => {
      const [x0, z0, x1, z1] = s.rect;
      const w = x1 - x0;
      const d = z1 - z0;
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), streetMat);
      mesh.position.set(x0 + w / 2, 0.05, z0 + d / 2);
      mesh.receiveShadow = true;
      mesh.userData = { layer: 'streets', entity: { type: 'street', name: s.name, desc: 'Paved thoroughfare with sidewalk margins.' } };
      scene.add(mesh);
    });

    // Elevated CP2 Overpass Bridge (+3.5m deck)
    const bridgeGeo = new THREE.BoxGeometry(22, 1.2, 38);
    const bridgeMat = new THREE.MeshStandardMaterial({
      color: '#2A3648',
      roughness: 0.7,
      metalness: 0.3
    });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(150, 3.5, 183);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    bridge.userData = { layer: 'buildings', entity: { type: 'bridge', name: 'Central Bridge (Overpass)', desc: 'Raised 3.5m overpass over Cross Street. Critical sniper vantage and wave funnel.' } };
    scene.add(bridge);

    // Bridge Ramps North and South
    const rampNorthGeo = new THREE.BoxGeometry(22, 0.8, 16);
    rampNorthGeo.rotateX(0.2);
    const rampNorth = new THREE.Mesh(rampNorthGeo, bridgeMat);
    rampNorth.position.set(150, 1.8, 160);
    rampNorth.castShadow = true;
    rampNorth.receiveShadow = true;
    scene.add(rampNorth);

    const rampSouthGeo = new THREE.BoxGeometry(22, 0.8, 16);
    rampSouthGeo.rotateX(-0.2);
    const rampSouth = new THREE.Mesh(rampSouthGeo, bridgeMat);
    rampSouth.position.set(150, 1.8, 206);
    rampSouth.castShadow = true;
    rampSouth.receiveShadow = true;
    scene.add(rampSouth);
  };

  const buildBuildings = (scene: THREE.Scene) => {
    const roofTex = getProceduralTexture('roof_generic');
    const facadeTex = getProceduralTexture('facade_office');

    BUILDINGS.forEach(b => {
      const [x0, z0, x1, z1] = b.footprint;
      const w = x1 - x0;
      const d = z1 - z0;
      const h = b.height;

      const geom = new THREE.BoxGeometry(w, h, d);
      const materials = [
        new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.8 }), // right
        new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.8 }), // left
        new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.6 }),   // top
        new THREE.MeshStandardMaterial({ color: '#1B2433' }),               // bottom
        new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.8 }), // front
        new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.8 })  // back
      ];

      const mesh = new THREE.Mesh(geom, materials);
      mesh.position.set(x0 + w / 2, h / 2, z0 + d / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        layer: 'buildings',
        entity: { ...b, type: 'building' }
      };
      scene.add(mesh);

      // Building Label Tag Sprite
      if (b.code) {
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 256;
        labelCanvas.height = 64;
        const ctx = labelCanvas.getContext('2d')!;
        ctx.fillStyle = '#0F1E33';
        ctx.roundRect(10, 10, 236, 44, 8);
        ctx.fill();
        ctx.strokeStyle = '#2A3F5C';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 22px Barlow Condensed, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${b.code} ${b.name.toUpperCase()}`, 128, 32);

        const labelTex = new THREE.CanvasTexture(labelCanvas);
        const spriteMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(x0 + w / 2, h + 8, z0 + d / 2);
        sprite.scale.set(36, 9, 1);
        sprite.userData = { layer: 'buildings' };
        scene.add(sprite);
      }
    });
  };

  const buildZones = (scene: THREE.Scene) => {
    ZONES.forEach(z => {
      const { x0, z0, x1, z1 } = z.bounds;
      const w = x1 - x0;
      const d = z1 - z0;

      // Dashed boundary line
      const points = [
        new THREE.Vector3(x0, 0.4, z0),
        new THREE.Vector3(x1, 0.4, z0),
        new THREE.Vector3(x1, 0.4, z1),
        new THREE.Vector3(x0, 0.4, z1),
        new THREE.Vector3(x0, 0.4, z0)
      ];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: z.color,
        dashSize: 6,
        gapSize: 4,
        linewidth: 2
      });
      const line = new THREE.Line(geom, lineMat);
      line.computeLineDistances();
      line.userData = { layer: z.type === 'safe' ? 'safeZone' : 'contestedZone', entity: z };
      scene.add(line);

      // Semi-transparent colored floor tint
      const fillMat = new THREE.MeshBasicMaterial({
        color: z.color,
        transparent: true,
        opacity: z.type === 'safe' ? 0.08 : 0.06,
        side: THREE.DoubleSide
      });
      const fill = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), fillMat);
      fill.position.set(x0 + w / 2, 0.2, z0 + d / 2);
      fill.userData = { layer: z.type === 'safe' ? 'safeZone' : 'contestedZone', entity: z };
      scene.add(fill);
    });

    // Extraction Pad Vertical Beam
    const extCenter = EXTRACTION_PAD.center;
    const beamGeo = new THREE.CylinderGeometry(8, 14, 180, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: '#E5202A',
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(extCenter.x, 90, extCenter.z);
    beam.name = 'extraction_beam';
    beam.userData = { layer: 'extractionPoint', entity: EXTRACTION_PAD };
    scene.add(beam);
    extractionBeamRef.current = beam;
  };

  const buildChokepoints = (scene: THREE.Scene) => {
    CHOKEPOINTS.forEach(cp => {
      // Danger cylinder
      const cylGeo = new THREE.CylinderGeometry(cp.radius, cp.radius, 12, 32, 1, true);
      const cylMat = new THREE.MeshBasicMaterial({
        color: '#E5202A',
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const cyl = new THREE.Mesh(cylGeo, cylMat);
      cyl.position.set(cp.x, 6, cp.z);
      cyl.name = `chokepoint_cylinder_${cp.id}`;
      cyl.userData = { layer: 'chokepoints', entity: { ...cp, type: 'chokepoint' } };
      scene.add(cyl);

      // Pulsing ring on floor
      const ringGeo = new THREE.RingGeometry(cp.radius - 1, cp.radius, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: '#E5202A',
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(cp.x, 0.3, cp.z);
      ring.userData = { layer: 'chokepoints', entity: { ...cp, type: 'chokepoint' } };
      scene.add(ring);
    });
  };

  const buildMarkers = (scene: THREE.Scene) => {
    // Spawns
    SPAWNS.forEach(s => {
      const geo = new THREE.CylinderGeometry(4, 4, 1.5, 16);
      const mat = new THREE.MeshStandardMaterial({ color: '#1EAEEF', roughness: 0.4 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(s.x, 0.75, s.z);
      mesh.userData = { layer: 'playerSpawns', entity: { ...s, type: 'spawn' } };
      scene.add(mesh);
    });

    // Objectives (Data Drives with Rotating Hologram Cube)
    OBJECTIVES.forEach(obj => {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(3, 3.5, 2, 16),
        new THREE.MeshStandardMaterial({ color: '#2A3F5C', metalness: 0.8, roughness: 0.2 })
      );
      pedestal.position.set(obj.x, 1, obj.z);
      pedestal.userData = { layer: 'objectives', entity: { ...obj, type: 'objective' } };
      scene.add(pedestal);

      // Floating hologram diamond
      const holoGeo = new THREE.OctahedronGeometry(2.5, 0);
      const holoMat = new THREE.MeshBasicMaterial({ color: '#FFD21F', wireframe: true });
      const holo = new THREE.Mesh(holoGeo, holoMat);
      holo.position.set(obj.x, 8, obj.z);
      holo.name = `obj_hologram_${obj.id}`;
      holo.userData = { layer: 'objectives', entity: { ...obj, type: 'objective' } };
      scene.add(holo);
    });

    // Horde Entries
    HORDE_ENTRIES.forEach(he => {
      const arrowGeo = new THREE.ConeGeometry(5, 10, 8);
      arrowGeo.rotateX(he.heading === 'south' ? Math.PI : 0);
      const arrowMat = new THREE.MeshBasicMaterial({ color: '#E5202A' });
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.position.set(he.x, 5, he.z);
      arrow.userData = { layer: 'hordeEntries', entity: { ...he, type: 'horde_entry' } };
      scene.add(arrow);
    });

    // Supply Caches
    const supplyTex = getProceduralTexture('spr_supply_box');
    SUPPLY_CACHES.forEach(sc => {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2.5, 2.5),
        new THREE.MeshStandardMaterial({ map: supplyTex, roughness: 0.5 })
      );
      box.position.set(sc.x, 1.25, sc.z);
      box.castShadow = true;
      box.userData = { layer: 'supplies', entity: { type: 'supply', name: 'Ammo / Medical Cache', desc: 'Resupply point offering combat munitions and trauma kits.' } };
      scene.add(box);
    });
  };

  const buildRoutes = (scene: THREE.Scene) => {
    ROUTES.forEach(r => {
      const points = r.points.map(p => new THREE.Vector3(p[0], 0.6, p[1]));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({
        color: r.color,
        dashSize: 4,
        gapSize: 3,
        linewidth: 3
      });
      (mat as any).userData = { isFlowMaterial: true };
      const line = new THREE.Line(geom, mat);
      line.computeLineDistances();
      const layerKey = r.type === 'player' ? 'playerRoutes' : r.type === 'flank' ? 'flankRoutes' : 'extractionRoutes';
      line.userData = { layer: layerKey, entity: { ...r, type: 'route' } };
      scene.add(line);
    });
  };

  const buildVegetationAndDebris = (scene: THREE.Scene) => {
    // Trees via billboard sprites
    const treeTex = getProceduralTexture('spr_tree');
    const treeMat = new THREE.SpriteMaterial({ map: treeTex, transparent: true });

    // Seeded tree placements (Park area x: 35-134, z: 193-296)
    for (let i = 0; i < 45; i++) {
      const tx = 38 + Math.random() * 90;
      const tz = 196 + Math.random() * 95;
      const sprite = new THREE.Sprite(treeMat);
      sprite.position.set(tx, 6, tz);
      const s = 10 + Math.random() * 6;
      sprite.scale.set(s, s, 1);
      sprite.userData = { layer: 'vegetation' };
      scene.add(sprite);
    }

    // Bus wrecks in Bus Depot
    const busGeo = new THREE.BoxGeometry(7, 4, 18);
    const busMat = new THREE.MeshStandardMaterial({ color: '#3A4D66', roughness: 0.9 });
    VEHICLES.buses.forEach(b => {
      const bus = new THREE.Mesh(busGeo, busMat);
      bus.position.set(b.x, 2, b.z);
      bus.rotation.y = b.rot;
      bus.castShadow = true;
      bus.userData = { layer: 'vehicles', entity: { type: 'vehicle', name: 'Abandoned City Bus', desc: 'Rusted municipal transport wreck providing heavy waist-high cover.' } };
      scene.add(bus);
    });

    // Car wrecks along streets
    const carGeo = new THREE.BoxGeometry(4.5, 2.2, 8.5);
    const carMat = new THREE.MeshStandardMaterial({ color: '#2B384A', roughness: 0.8 });
    VEHICLES.cars.forEach(c => {
      const car = new THREE.Mesh(carGeo, carMat);
      car.position.set(c.x, 1.1, c.z);
      car.rotation.y = c.rot;
      car.castShadow = true;
      car.userData = { layer: 'vehicles', entity: { type: 'vehicle', name: 'Civilian Vehicle Wreck', desc: 'Burned out sedan chassis providing ballistic shelter.' } };
      scene.add(car);
    });
  };

  const buildHeatmapPlane = (scene: THREE.Scene) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    heatmapCanvasRef.current = canvas;
    heatmapTextureRef.current = tex;

    const geo = new THREE.PlaneGeometry(MAP_DIMENSIONS.width, MAP_DIMENSIONS.depth);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.position.set(MAP_DIMENSIONS.width / 2, 0.4, MAP_DIMENSIONS.depth / 2);
    plane.visible = showHeatmap;
    scene.add(plane);
    heatmapPlaneRef.current = plane;
  };

  useEffect(() => {
    if (heatmapPlaneRef.current) {
      heatmapPlaneRef.current.visible = showHeatmap;
    }
  }, [showHeatmap]);

  const buildHordeAgents = (scene: THREE.Scene) => {
    const geo = new THREE.SphereGeometry(1.2, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: '#E5202A' });
    const instMesh = new THREE.InstancedMesh(geo, mat, 500);
    instMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instMesh.count = 0;
    scene.add(instMesh);
    hordeInstancedMeshRef.current = instMesh;
  };

  const buildPlayers = (scene: THREE.Scene) => {
    // Player 1 Avatar (Cyan)
    const p1Geo = new THREE.CylinderGeometry(1.8, 1.8, 4, 16);
    const p1Mat = new THREE.MeshStandardMaterial({ color: '#1EAEEF', roughness: 0.3, emissive: '#0E557C' });
    const p1 = new THREE.Mesh(p1Geo, p1Mat);
    p1.position.set(SPAWNS[0].x, 2, SPAWNS[0].z);
    p1.castShadow = true;
    scene.add(p1);
    player1MeshRef.current = p1;

    // Player 2 Avatar (Cyan/Yellow)
    const p2Geo = new THREE.CylinderGeometry(1.8, 1.8, 4, 16);
    const p2Mat = new THREE.MeshStandardMaterial({ color: '#FFD21F', roughness: 0.3, emissive: '#7C660E' });
    const p2 = new THREE.Mesh(p2Geo, p2Mat);
    p2.position.set(SPAWNS[1].x, 2, SPAWNS[1].z);
    p2.castShadow = true;
    scene.add(p2);
    player2MeshRef.current = p2;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className="relative w-full h-full cursor-crosshair overflow-hidden touch-none"
    >
      {/* 2D/3D Mode Watermark */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-2 font-mono-numbers text-xs bg-[#0F1E33]/80 border border-[#2A3F5C] px-3 py-1.5 rounded text-[#8FA3BC] backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-[#1EAEEF] animate-pulse"></span>
        <span>VIEWPORT: {viewMode === '2D' ? 'ORTHO TACTICAL 2D' : 'PERSPECTIVE 3D RECON'}</span>
        <span className="text-[#2A3F5C]">|</span>
        <span>TOD: {timeOfDay}</span>
      </div>

      {/* Dynamic Scale Bar & North Arrow */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex items-center gap-4 bg-[#0F1E33]/85 border border-[#2A3F5C] px-4 py-2 rounded font-mono-numbers text-xs text-[#E8EEF6] backdrop-blur-md">
        <div className="flex flex-col items-center">
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#E5202A]"></div>
          <span className="font-condensed font-bold text-[10px] text-[#E8EEF6] tracking-widest mt-0.5">N</span>
        </div>
        <div className="h-6 w-px bg-[#2A3F5C]"></div>
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-[10px] text-[#8FA3BC]">
            <span>0m</span>
            <span>50m</span>
            <span>100m</span>
          </div>
          <div className="w-32 h-1.5 bg-[#14263F] border border-[#2A3F5C] relative flex">
            <div className="w-1/2 h-full bg-[#E8EEF6]"></div>
            <div className="w-1/2 h-full bg-[#2A3F5C]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Polyline interpolation helper for mission playback
function interpolatePolyline(points: [number, number][], t: number): { x: number; z: number } {
  if (points.length === 0) return { x: 0, z: 0 };
  if (points.length === 1 || t <= 0) return { x: points[0][0], z: points[0][1] };
  if (t >= 1) return { x: points[points.length - 1][0], z: points[points.length - 1][1] };

  // Calculate segment lengths
  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const d = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    lengths.push(d);
    totalLength += d;
  }

  const targetDist = t * totalLength;
  let accumulated = 0;

  for (let i = 0; i < lengths.length; i++) {
    if (accumulated + lengths[i] >= targetDist) {
      const segT = (targetDist - accumulated) / lengths[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      return {
        x: p1[0] + (p2[0] - p1[0]) * segT,
        z: p1[1] + (p2[1] - p1[1]) * segT
      };
    }
    accumulated += lengths[i];
  }

  return { x: points[points.length - 1][0], z: points[points.length - 1][1] };
}
