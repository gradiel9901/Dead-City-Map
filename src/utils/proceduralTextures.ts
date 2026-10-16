import * as THREE from 'three';

const textureCache = new Map<string, THREE.Texture>();

/**
 * Chroma-key utility to strip flat #FF00FF magenta background and soften fringes
 */
export function chromaKey(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  options: { key?: string; tolerance?: number; feather?: number } = {}
): THREE.CanvasTexture {
  const { tolerance = 60, feather = 12 } = options;
  const canvas = document.createElement('canvas');
  canvas.width = sourceImage.width;
  canvas.height = sourceImage.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.drawImage(sourceImage, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Target magenta: R ~ 255, G ~ 0, B ~ 255
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt(
      Math.pow(r - 255, 2) + Math.pow(g - 0, 2) + Math.pow(b - 255, 2)
    );

    if (dist < tolerance) {
      data[i + 3] = 0; // fully transparent
    } else if (dist < tolerance + feather) {
      const alpha = (dist - tolerance) / feather;
      data[i + 3] = Math.round(data[i + 3] * alpha);
      // de-spill magenta fringe
      data[i] = Math.min(data[i], data[i + 1] + 30);
      data[i + 2] = Math.min(data[i + 2], data[i + 1] + 30);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Helper to build an offscreen canvas and return a THREE.CanvasTexture
 */
function makeCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Create procedural textures with tactical aesthetics
 */
export function getProceduralTexture(name: string): THREE.Texture {
  if (textureCache.has(name)) {
    return textureCache.get(name)!;
  }

  let tex: THREE.Texture;

  switch (name) {
    case 'hero_ground_plate':
      tex = makeCanvasTexture(1024, 1024, (ctx, w, h) => {
        // Deep tactical navy-slate ground
        ctx.fillStyle = '#0E1724';
        ctx.fillRect(0, 0, w, h);

        // Subtle topographic / street grid lines
        ctx.strokeStyle = '#18273E';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Central Plaza paver area
        ctx.fillStyle = '#1B2C46';
        ctx.fillRect(w * 0.38, h * 0.24, w * 0.22, h * 0.27);
        // Fountain circle in plaza
        ctx.strokeStyle = '#2A4368';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w * 0.5, h * 0.38, 28, 0, Math.PI * 2);
        ctx.stroke();

        // Park greenery
        ctx.fillStyle = '#102820';
        ctx.fillRect(w * 0.11, h * 0.58, w * 0.33, h * 0.32);

        // Extraction lawn
        ctx.fillStyle = '#143825';
        ctx.fillRect(w * 0.81, h * 0.76, w * 0.14, h * 0.15);

        // Bus depot concrete lot
        ctx.fillStyle = '#152233';
        ctx.fillRect(w * 0.57, h * 0.69, w * 0.16, h * 0.13);

        // Roads
        ctx.fillStyle = '#0B111A';
        // Central avenue N-S
        ctx.fillRect(w * 0.46, 0, w * 0.08, h);
        // Cross street E-W
        ctx.fillRect(0, h * 0.54, w, h * 0.06);
        // North lane E-W
        ctx.fillRect(w * 0.12, h * 0.29, w * 0.75, h * 0.04);
        // East street N-S
        ctx.fillRect(w * 0.75, h * 0.56, w * 0.05, h * 0.44);

        // Road dashed lane dividers
        ctx.strokeStyle = '#3E4F68';
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 0);
        ctx.lineTo(w * 0.5, h);
        ctx.moveTo(0, h * 0.57);
        ctx.lineTo(w, h * 0.57);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      break;

    case 'tex_asphalt':
      tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#181C22';
        ctx.fillRect(0, 0, w, h);
        // Noise & aggregate
        for (let i = 0; i < 600; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          const val = Math.random() > 0.5 ? 40 : 15;
          ctx.fillStyle = `rgb(${val}, ${val + 2}, ${val + 4})`;
          ctx.fillRect(x, y, 1.5, 1.5);
        }
        // Small cracks
        ctx.strokeStyle = '#0E1014';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(80, 50);
        ctx.lineTo(110, 40);
        ctx.stroke();
      });
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      break;

    case 'tex_plaza_pavers':
      tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#222C3A';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#141A23';
        ctx.lineWidth = 2;
        const step = 32;
        for (let x = 0; x <= w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y <= h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      });
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      break;

    case 'roof_generic':
    case 'roof_office':
      tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#212A38';
        ctx.fillRect(0, 0, w, h);
        // Gravel roof border
        ctx.strokeStyle = '#141A23';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, w - 6, h - 6);
        // HVAC vents
        ctx.fillStyle = '#324054';
        ctx.fillRect(40, 40, 50, 30);
        ctx.fillRect(140, 60, 40, 40);
        ctx.fillRect(80, 160, 70, 35);
        // Slits
        ctx.fillStyle = '#1A2330';
        for (let y = 44; y < 66; y += 4) ctx.fillRect(45, y, 40, 2);
        for (let y = 164; y < 190; y += 4) ctx.fillRect(85, y, 60, 2);
      });
      break;

    case 'facade_office':
      tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#1A2433';
        ctx.fillRect(0, 0, w, h);
        // Windows
        const cols = 8;
        const rows = 12;
        const cw = w / cols;
        const ch = h / rows;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const lit = (c + r * 3) % 7 === 0;
            ctx.fillStyle = lit ? '#FFD21F' : '#0B121C';
            ctx.fillRect(c * cw + 4, r * ch + 4, cw - 8, ch - 8);
          }
        }
      });
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      break;

    case 'facade_residential':
      tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#262D38';
        ctx.fillRect(0, 0, w, h);
        const cols = 6;
        const rows = 10;
        const cw = w / cols;
        const ch = h / rows;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            ctx.fillStyle = '#10151C';
            ctx.fillRect(c * cw + 6, r * ch + 5, cw - 12, ch - 10);
            // balcony railing
            ctx.fillStyle = '#394250';
            ctx.fillRect(c * cw + 4, r * ch + ch - 4, cw - 8, 3);
          }
        }
      });
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      break;

    case 'spr_tree':
      tex = makeCanvasTexture(128, 128, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        // Overlapping tree canopy circles
        const circles = [
          { x: 64, y: 64, r: 44, color: '#1B4D32' },
          { x: 52, y: 56, r: 32, color: '#246342' },
          { x: 74, y: 52, r: 30, color: '#2B724C' },
          { x: 68, y: 76, r: 28, color: '#18422A' },
          { x: 50, y: 72, r: 24, color: '#1E5236' },
        ];
        for (const c of circles) {
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center texture leaf specs
        ctx.fillStyle = '#388E5E';
        for (let i = 0; i < 40; i++) {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.random() * 32;
          ctx.fillRect(64 + Math.cos(ang) * rad, 64 + Math.sin(ang) * rad, 3, 3);
        }
      });
      break;

    case 'spr_agent_horde':
      tex = makeCanvasTexture(64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        // Tactical red circle with alert dot
        ctx.fillStyle = '#E5202A';
        ctx.beginPath();
        ctx.arc(32, 32, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF6B72';
        ctx.beginPath();
        ctx.arc(32, 32, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFE0E0';
        ctx.lineWidth = 3;
        ctx.stroke();
      });
      break;

    case 'spr_player_avatar':
      tex = makeCanvasTexture(64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#1EAEEF';
        ctx.beginPath();
        ctx.arc(32, 32, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(32, 32, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#A5E7FF';
        ctx.lineWidth = 4;
        ctx.stroke();
      });
      break;

    case 'spr_supply_box':
      tex = makeCanvasTexture(64, 64, (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#254B33';
        ctx.fillRect(8, 8, 48, 48);
        ctx.strokeStyle = '#2ECC40';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, 48, 48);
        // Green medical cross
        ctx.fillStyle = '#2ECC40';
        ctx.fillRect(26, 16, 12, 32);
        ctx.fillRect(16, 26, 32, 12);
      });
      break;

    default:
      tex = makeCanvasTexture(64, 64, (ctx, w, h) => {
        ctx.fillStyle = '#1F2A38';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#394E68';
        ctx.strokeRect(2, 2, w - 4, h - 4);
      });
      break;
  }

  textureCache.set(name, tex);
  return tex;
}
