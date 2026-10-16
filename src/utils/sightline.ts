import { BUILDINGS } from '../data/mapData';

export interface LineSegment {
  p1: { x: number; z: number };
  p2: { x: number; z: number };
}

// Extract line segments from all building footprints
function getObstacleSegments(): LineSegment[] {
  const segments: LineSegment[] = [];

  BUILDINGS.forEach(b => {
    const [x0, z0, x1, z1] = b.footprint;
    segments.push({ p1: { x: x0, z: z0 }, p2: { x: x1, z: z0 } });
    segments.push({ p1: { x: x1, z: z0 }, p2: { x: x1, z: z1 } });
    segments.push({ p1: { x: x1, z: z1 }, p2: { x: x0, z: z1 } });
    segments.push({ p1: { x: x0, z: z1 }, p2: { x: x0, z: z0 } });

    if (b.subStructures) {
      b.subStructures.forEach(sub => {
        const [sx0, sz0, sx1, sz1] = sub.footprint;
        segments.push({ p1: { x: sx0, z: sz0 }, p2: { x: sx1, z: sz0 } });
        segments.push({ p1: { x: sx1, z: sz0 }, p2: { x: sx1, z: sz1 } });
        segments.push({ p1: { x: sx1, z: sz1 }, p2: { x: sx0, z: sz1 } });
        segments.push({ p1: { x: sx0, z: sz1 }, p2: { x: sx0, z: sz0 } });
      });
    }
  });

  return segments;
}

// Ray-segment intersection
function getRayIntersection(
  rayOrigin: { x: number; z: number },
  rayDir: { x: number; z: number },
  maxDist: number,
  seg: LineSegment
): number | null {
  const dx = seg.p2.x - seg.p1.x;
  const dz = seg.p2.z - seg.p1.z;

  const denom = rayDir.x * dz - rayDir.z * dx;
  if (Math.abs(denom) < 1e-6) return null;

  const t1 = ((seg.p1.x - rayOrigin.x) * dz - (seg.p1.z - rayOrigin.z) * dx) / denom;
  const t2 = ((seg.p1.x - rayOrigin.x) * rayDir.z - (seg.p1.z - rayOrigin.z) * rayDir.x) / denom;

  if (t1 > 0 && t1 <= maxDist && t2 >= 0 && t2 <= 1) {
    return t1;
  }
  return null;
}

/**
 * Computes 2D sightline visibility polygon casting rays every 1.5 deg up to 80m
 */
export function computeSightlinePolygon(
  origin: { x: number; z: number },
  maxDist = 80
): [number, number][] {
  const segments = getObstacleSegments();
  const stepDeg = 1.5;
  const totalRays = Math.round(360 / stepDeg);
  const polygon: [number, number][] = [];

  for (let i = 0; i < totalRays; i++) {
    const angle = (i * stepDeg * Math.PI) / 180;
    const rayDir = { x: Math.cos(angle), z: Math.sin(angle) };

    let closestDist = maxDist;

    for (const seg of segments) {
      const hit = getRayIntersection(origin, rayDir, maxDist, seg);
      if (hit !== null && hit < closestDist) {
        closestDist = hit;
      }
    }

    polygon.push([origin.x + rayDir.x * closestDist, origin.z + rayDir.z * closestDist]);
  }

  return polygon;
}
