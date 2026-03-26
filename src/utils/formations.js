import { PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX, PARTICLE_COLORS } from './constants.js'

// Helper: random in range
const rng = (min, max) => min + Math.random() * (max - min)

// Helper: assign random color from palette
function assignColor(colorArray, i) {
  const palette = PARTICLE_COLORS
  const colorIndex = Math.floor(Math.random() * palette.length)
  const [r, g, b] = palette[colorIndex]
  colorArray[i * 3]     = r
  colorArray[i * 3 + 1] = g
  colorArray[i * 3 + 2] = b
}

// Helper: assign sizes
function assignSize(sizeArray, i, scale = 1.0) {
  sizeArray[i] = rng(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX) * scale
}

// ── FORMATION 0: Hero – Spherical nebula ──────────────────────────────────
export function generateNebula(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const radius = Math.min(W, H) * 0.65

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere distribution for organic scatter
    const phi   = Math.acos(1 - 2 * (i + 0.5) / count)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    // Add randomness to break the pattern
    const r = radius * Math.cbrt(Math.random()) * (0.4 + Math.random() * 0.6)
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
    pos[i*3+1] = r * Math.cos(phi) * rng(-0.7, 1.4)
    pos[i*3+2] = rng(-180, 80)

    assignColor(col, i)
    assignSize(siz, i, 1.0)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.5 + Math.random() * 0.5
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 1: Ecosystem – Web / network graph ──────────────────────────
export function generateNetwork(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const NODES = 14
  const spread = Math.min(W, H) * 0.72
  // Generate random node positions
  const nodes = Array.from({ length: NODES }, () => ({
    x: rng(-spread, spread),
    y: rng(-spread * 0.7, spread * 0.7)
  }))

  const perNode = Math.floor(count / NODES)

  for (let i = 0; i < count; i++) {
    const nodeIdx = Math.min(Math.floor(i / perNode), NODES - 1)
    const node = nodes[nodeIdx]

    if (i % 8 === 0 && i < NODES * 12) {
      // ~12 particles sit exactly on node centers (bright nodes)
      const ni = Math.floor(i / 12)
      if (ni < NODES) {
        pos[i*3]   = nodes[ni].x
        pos[i*3+1] = nodes[ni].y
        pos[i*3+2] = 0
        siz[i] = PARTICLE_SIZE_MAX * 1.4
        alp[i] = 1.0
        col[i*3] = 0.0; col[i*3+1] = 0.83; col[i*3+2] = 1.0 // bright cyan
        pha[i] = Math.random() * Math.PI * 2
        continue
      }
    }

    // Rest: scattered around node or on "edges" between nodes
    const onEdge = Math.random() > 0.5
    if (onEdge) {
      // Position along a random edge
      const n2 = nodes[Math.floor(Math.random() * NODES)]
      const t  = Math.random()
      pos[i*3]   = node.x + (n2.x - node.x) * t + rng(-18, 18)
      pos[i*3+1] = node.y + (n2.y - node.y) * t + rng(-18, 18)
    } else {
      // Scatter around node
      const d = rng(5, 60)
      const a = Math.random() * Math.PI * 2
      pos[i*3]   = node.x + Math.cos(a) * d
      pos[i*3+1] = node.y + Math.sin(a) * d
    }
    pos[i*3+2] = rng(-120, 60)

    assignColor(col, i)
    assignSize(siz, i, 0.85)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.4 + Math.random() * 0.5
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 2: Services – Three vertical columns ────────────────────────
export function generateColumns(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const colW  = W * 0.22
  const colX  = [-W * 0.38, 0, W * 0.38]
  const perCol = Math.floor(count / 3)

  for (let i = 0; i < count; i++) {
    const c = Math.min(Math.floor(i / perCol), 2)
    pos[i*3]   = colX[c] + rng(-colW * 0.4, colW * 0.4)
    pos[i*3+1] = rng(-H * 0.62, H * 0.62)
    pos[i*3+2] = rng(-200, 80)

    assignColor(col, i)
    assignSize(siz, i, 0.9)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.35 + Math.random() * 0.5
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 3: AI Solutions – Sinusoidal 3D ribbon ─────────────────────
export function generateRibbon(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const span = W * 1.4

  for (let i = 0; i < count; i++) {
    const t   = (i / count) * Math.PI * 5 - Math.PI * 2.5
    const x   = (i / count - 0.5) * span
    const amp = H * 0.38
    // Multiple frequency ribbon
    const y   = amp * Math.sin(t) * 0.6 + amp * Math.sin(t * 1.7) * 0.25 + rng(-25, 25)
    const z   = amp * 0.4 * Math.cos(t * 0.8) + rng(-80, 80)

    pos[i*3]   = x
    pos[i*3+1] = y
    pos[i*3+2] = z

    assignColor(col, i)
    assignSize(siz, i, 0.85 + Math.abs(Math.sin(t)) * 0.3)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.4 + 0.5 * (1 - Math.abs(x) / span * 0.7)
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 4: SEO – Concentric rings ──────────────────────────────────
export function generateRings(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const RINGS    = 6
  const maxR     = Math.min(W, H) * 0.72
  const perRing  = Math.floor(count / RINGS)

  for (let i = 0; i < count; i++) {
    const ring   = Math.min(Math.floor(i / perRing), RINGS - 1)
    const radius = maxR * ((ring + 1) / RINGS) * (0.85 + Math.random() * 0.3)
    const angle  = ((i % perRing) / perRing) * Math.PI * 2 + rng(-0.08, 0.08)
    const scatter = 14 + ring * 4

    pos[i*3]   = Math.cos(angle) * radius + rng(-scatter, scatter)
    pos[i*3+1] = Math.sin(angle) * radius * 0.45 + rng(-scatter * 0.5, scatter * 0.5)
    pos[i*3+2] = -ring * 30 + rng(-40, 40)

    assignColor(col, i)
    assignSize(siz, i, 0.7 + (RINGS - ring) / RINGS * 0.6)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.3 + ((RINGS - ring) / RINGS) * 0.55
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 5: Performance – Helix/vortex ──────────────────────────────
export function generateVortex(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const ARMS  = 3
  const turns = 4.5
  const maxR  = Math.min(W, H) * 0.6

  for (let i = 0; i < count; i++) {
    const arm    = i % ARMS
    const t      = (Math.floor(i / ARMS) / (count / ARMS))
    const angle  = t * Math.PI * 2 * turns + (arm / ARMS) * Math.PI * 2
    const radius = maxR * t * (0.85 + Math.random() * 0.15)
    const scatter = 8 + t * 30

    pos[i*3]   = Math.cos(angle) * radius + rng(-scatter, scatter)
    pos[i*3+1] = Math.sin(angle) * radius * 0.6 + rng(-scatter * 0.5, scatter * 0.5) - H * 0.08
    pos[i*3+2] = t * -160 + rng(-60, 60)

    assignColor(col, i)
    assignSize(siz, i, 0.7 + t * 0.5)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.35 + t * 0.5
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 6: Method – Four quadrant clusters ─────────────────────────
export function generateQuadrants(count, W, H) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const siz = new Float32Array(count)
  const pha = new Float32Array(count)
  const alp = new Float32Array(count)

  const cx = W * 0.35
  const cy = H * 0.3
  const centers = [
    [-cx,  cy], [cx,  cy],
    [-cx, -cy], [cx, -cy]
  ]
  const perQ   = Math.floor(count / 4)
  const spread = Math.min(W, H) * 0.22

  for (let i = 0; i < count; i++) {
    const q = Math.min(Math.floor(i / perQ), 3)
    const [qx, qy] = centers[q]
    // Gaussian-ish spread
    const r  = spread * Math.sqrt(-2 * Math.log(Math.max(0.001, Math.random()))) * 0.4
    const a  = Math.random() * Math.PI * 2
    pos[i*3]   = qx + Math.cos(a) * r
    pos[i*3+1] = qy + Math.sin(a) * r
    pos[i*3+2] = rng(-150, 70)

    assignColor(col, i)
    assignSize(siz, i, 0.8 + Math.random() * 0.4)
    pha[i] = Math.random() * Math.PI * 2
    alp[i] = 0.4 + Math.random() * 0.5
  }
  return { pos, col, siz, pha, alp }
}

// ── FORMATION 7: Logo – built externally by logoSampler ──────────────────
// This returns a placeholder; the real data is injected by logoSampler.js
export function generateLogoPending(count, W, H) {
  return generateNebula(count, W, H)
}

// ── DISPATCH ─────────────────────────────────────────────────────────────
export function generateFormation(index, count, W, H) {
  switch (index) {
    case 0: return generateNebula(count, W, H)
    case 1: return generateNetwork(count, W, H)
    case 2: return generateColumns(count, W, H)
    case 3: return generateRibbon(count, W, H)
    case 4: return generateRings(count, W, H)
    case 5: return generateVortex(count, W, H)
    case 6: return generateQuadrants(count, W, H)
    case 7: return generateLogoPending(count, W, H)
    default: return generateNebula(count, W, H)
  }
}
