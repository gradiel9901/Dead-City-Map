import { SPAWNS, OBJECTIVES, EXTRACTION_PAD, CHOKEPOINTS, ROUTES } from '../data/mapData';

export interface NavNode {
  id: string;
  x: number;
  z: number;
  neighbors: { node: NavNode; weight: number }[];
}

export interface PathResult {
  distance: number;
  path: [number, number][];
  traversedChokepoints: string[];
}

export interface FairnessMetric {
  targetId: string;
  targetName: string;
  s1Distance: number;
  s2Distance: number;
  deltaMeters: number;
  deltaPercent: number;
  verdict: 'BALANCED' | 'SKEWED';
  s1Path: [number, number][];
  s2Path: [number, number][];
}

class NavigationGraph {
  nodes: Map<string, NavNode> = new Map();

  constructor() {
    this.buildGraph();
  }

  private addNode(id: string, x: number, z: number): NavNode {
    if (this.nodes.has(id)) {
      return this.nodes.get(id)!;
    }
    const node: NavNode = { id, x, z, neighbors: [] };
    this.nodes.set(id, node);
    return node;
  }

  private addEdge(nodeA: NavNode, nodeB: NavNode) {
    const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.z - nodeB.z);
    if (!nodeA.neighbors.some(n => n.node.id === nodeB.id)) {
      nodeA.neighbors.push({ node: nodeB, weight: dist });
    }
    if (!nodeB.neighbors.some(n => n.node.id === nodeA.id)) {
      nodeB.neighbors.push({ node: nodeA, weight: dist });
    }
  }

  private buildGraph() {
    // 1. Add all route points and connect consecutive points
    ROUTES.forEach((route) => {
      let prevNode: NavNode | null = null;
      route.points.forEach((pt, idx) => {
        const nodeId = `${route.id}_p${idx}`;
        const currNode = this.addNode(nodeId, pt[0], pt[1]);
        if (prevNode) {
          this.addEdge(prevNode, currNode);
        }
        prevNode = currNode;
      });
    });

    // 2. Add Key Points: Spawns, Objectives, Extraction, Chokepoints
    SPAWNS.forEach(s => this.addNode(s.id, s.x, s.z));
    OBJECTIVES.forEach(obj => this.addNode(obj.id, obj.x, obj.z));
    this.addNode(EXTRACTION_PAD.id, EXTRACTION_PAD.center.x, EXTRACTION_PAD.center.z);
    CHOKEPOINTS.forEach(cp => this.addNode(cp.id, cp.x, cp.z));

    // 3. Connect nodes that are close to each other (< 12 meters) to create network intersections
    const allNodes = Array.from(this.nodes.values());
    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const a = allNodes[i];
        const b = allNodes[j];
        const dist = Math.hypot(a.x - b.x, a.z - b.z);
        if (dist <= 12.0) {
          this.addEdge(a, b);
        }
      }
    }
  }

  public findShortestPath(startId: string, endId: string): PathResult {
    const startNode = this.nodes.get(startId);
    const endNode = this.nodes.get(endId);

    if (!startNode || !endNode) {
      return { distance: Infinity, path: [], traversedChokepoints: [] };
    }

    const distances = new Map<string, number>();
    const previous = new Map<string, NavNode | null>();
    const visited = new Set<string>();
    const unvisited: NavNode[] = [];

    this.nodes.forEach(node => {
      distances.set(node.id, Infinity);
      previous.set(node.id, null);
      unvisited.push(node);
    });

    distances.set(startNode.id, 0);

    while (unvisited.length > 0) {
      // Find node with minimum distance
      unvisited.sort((a, b) => (distances.get(a.id) ?? Infinity) - (distances.get(b.id) ?? Infinity));
      const current = unvisited.shift()!;

      if ((distances.get(current.id) ?? Infinity) === Infinity) break;
      if (current.id === endNode.id) break;

      visited.add(current.id);

      for (const edge of current.neighbors) {
        if (visited.has(edge.node.id)) continue;
        const alt = (distances.get(current.id) ?? 0) + edge.weight;
        if (alt < (distances.get(edge.node.id) ?? Infinity)) {
          distances.set(edge.node.id, alt);
          previous.set(edge.node.id, current);
        }
      }
    }

    // Reconstruct path
    const path: [number, number][] = [];
    let curr: NavNode | null = endNode;
    while (curr) {
      path.unshift([curr.x, curr.z]);
      curr = previous.get(curr.id) || null;
    }

    // Identify if any chokepoints are traversed
    const traversedCps: string[] = [];
    CHOKEPOINTS.forEach(cp => {
      for (const [px, pz] of path) {
        if (Math.hypot(px - cp.x, pz - cp.z) <= cp.radius) {
          if (!traversedCps.includes(cp.code)) traversedCps.push(cp.code);
          break;
        }
      }
    });

    return {
      distance: Math.round((distances.get(endNode.id) ?? 0) * 10) / 10,
      path,
      traversedChokepoints: traversedCps
    };
  }

  public computeFairnessReport(): { metrics: FairnessMetric[]; cpExposure: Record<string, number> } {
    const targets = [
      { id: 'obj1', name: 'Data Drive 1 (Plaza)' },
      { id: 'obj2', name: 'Data Drive 2 (Metro)' },
      { id: 'obj3', name: 'Data Drive 3 (Depot)' },
      { id: EXTRACTION_PAD.id, name: 'Extraction Pad' },
    ];

    const cpCount: Record<string, number> = { CP1: 0, CP2: 0, CP3: 0 };

    const metrics: FairnessMetric[] = targets.map(t => {
      const s1Res = this.findShortestPath('s1', t.id);
      const s2Res = this.findShortestPath('s2', t.id);

      s1Res.traversedChokepoints.forEach(cp => { cpCount[cp] = (cpCount[cp] || 0) + 1; });
      s2Res.traversedChokepoints.forEach(cp => { cpCount[cp] = (cpCount[cp] || 0) + 1; });

      const d1 = s1Res.distance;
      const d2 = s2Res.distance;
      const deltaMeters = Math.round((d2 - d1) * 10) / 10;
      const minD = Math.min(d1, d2);
      const deltaPercent = minD > 0 ? Math.round((Math.abs(d2 - d1) / minD) * 100) : 0;
      const verdict: 'BALANCED' | 'SKEWED' = deltaPercent <= 15 ? 'BALANCED' : 'SKEWED';

      return {
        targetId: t.id,
        targetName: t.name,
        s1Distance: d1,
        s2Distance: d2,
        deltaMeters,
        deltaPercent,
        verdict,
        s1Path: s1Res.path,
        s2Path: s2Res.path
      };
    });

    return { metrics, cpExposure: cpCount };
  }
}

export const navGraph = new NavigationGraph();
