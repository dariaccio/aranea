/**
 * Analytical SVG path sampler — builds particle formations by tracing
 * every stroke path mathematically, with no canvas rasterization.
 *
 * Pipeline:
 *   tokenizePath(d)       -> flat array of { cmd, args[] }
 *   buildSegments(tokens) -> absolute-coordinate line/cubic segments
 *   samplePath(d, step)   -> { x, y } points at arc-length `step` intervals
 *   sampleLogoPositions() -> Float32Arrays (public API unchanged)
 *
 * Handles: M m L l H h V v C c S s Z z
 * All paths in risorsa5ara.svg are covered by these commands.
 */

const SVG_W = 116.48
const SVG_H = 133.78

// Argument counts per SVG path command
const ARGS_PER_CMD = { M:2, L:2, H:1, V:1, C:6, S:4, Z:0 }

// Inline fallback SVG — used when the network request fails
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.48 133.78">
<defs><style>
  .c1{fill:white;stroke:white;stroke-width:3}
  .c2{fill:none}
  .c3{fill:none;stroke:white;stroke-miterlimit:10;stroke-width:3.5px}
  .c4{clip-path:url(#cp)}
</style>
<clipPath id="cp"><path class="c2" d="M1.83,33.87L58.15,1.19c.21-.12.46-.12.67,0l56.33,32.68c.2.12.33.34.33.57v65.37c0,.24-.13.46-.33.57l-56.33,32.68c-.21.12-.46.12-.67,0L1.83,100.39c-.2-.12-.33-.34-.33-.57V34.44c0-.24.13-.46.33-.57Z"/></clipPath>
</defs>
<g><g class="c4">
<path class="c3" d="M75.98,3.46c.09,0,.16.07.16.16l.2,31.68c0,.06-.03.11-.08.14l-6.58,4.23c-.08.05-.18.03-.23-.05-.05-.08-.03-.18.05-.23l6.5-4.18-.2-31.59c0-.09.07-.17.16-.17h0Z"/>
<path class="c3" d="M40.18,3.46c-.09,0-.16.07-.16.16l-.2,31.68c0,.06.03.11.08.14l6.58,4.23c.08.05.18.03.23-.05.05-.08.03-.18-.05-.23l-6.5-4.18.2-31.59c0-.09-.07-.17-.16-.17h0Z"/>
<path class="c3" d="M29.08,50.2h0l-7.69-.4c-.05,0-.1-.03-.13-.08L1.19,18.56c-.05-.08-.03-.18.05-.23.08-.05.18-.03.23.05l20.01,31.1,7.61.4c.09,0,.16.08.16.17,0,.09-.08.16-.16.16Z"/>
<path class="c3" d="M87.89,50.2h0l7.69-.4c.05,0,.1-.03.13-.08l20.06-31.17c.05-.08.03-.18-.05-.23-.08-.05-.18-.03-.23.05l-20.01,31.1-7.61.4c-.09,0-.16.08-.16.17,0,.09.08.16.16.16Z"/>
<path class="c3" d="M75.98,130.5c.09,0,.16-.07.16-.16l.2-31.68c0-.06-.03-.11-.08-.14l-6.58-4.23c-.08-.05-.18-.03-.23.05-.05.08-.03.18.05.23l6.5,4.18-.2,31.59c0,.09.07.17.16.17h0Z"/>
<path class="c3" d="M40.18,130.5c-.09,0-.16-.07-.16-.16l-.2-31.68c0-.06.03-.11.08-.14l6.58-4.23c.08-.05.18-.03.23.05.05.08.03.18-.05.23l-6.5,4.18.2,31.59c0,.09-.07.17-.16.17h0Z"/>
<path class="c3" d="M29.08,83.75h0l-7.69.4c-.05,0-.1.03-.13.08L1.19,115.4c-.05.08-.03.18.05.23.08.05.18.03.23-.05l20.01-31.1,7.61-.4c.09,0,.16-.08.16-.17,0-.09-.08-.16-.16-.16Z"/>
<path class="c3" d="M87.23,83.75h0s7.69.4,7.69.4c.05,0,.1.03.13.08l20.06,31.17c.05.08.03.18-.05.23-.08.05-.18.03-.23-.05l-20.01-31.1-7.61-.4c-.09,0-.16-.08-.16-.17,0-.09.08-.16.16-.16Z"/>
</g>
<path class="c3" d="M29.08,50.43c0-.24.13-.45.33-.57l28.5-16.45c.2-.12.45-.12.66,0l28.5,16.45c.2.12.33.33.33.57v32.91c0,.24-.13.45-.33.57l-28.5,16.45c-.2.12-.45.12-.66,0l-28.5-16.45c-.2-.12-.33-.33-.33-.57v-32.91Z"/>
<path class="c3" d="M76.64,66.21l-18.17,8.76c-.17.08-.31.08-.48,0l-18.16-8.88M39.84,79.97v-20.55c0-.22.12-.42.3-.53l17.79-10.27c.19-.11.42-.11.61,0l17.79,10.27c.19.11.3.31.3.53v20.55"/>
<path class="c1" d="M58.24,133.78c-.41,0-.81-.11-1.16-.31L1.16,101.18c-.71-.41-1.16-1.18-1.16-2.01V34.6c0-.82.44-1.59,1.16-2.01L57.08.3c.7-.41,1.61-.41,2.32,0l55.92,32.29c.71.41,1.16,1.18,1.16,2.01v64.58c0,.83-.44,1.59-1.16,2.01l-55.92,32.29c-.35.2-.75.31-1.16.31ZM58.24,1.99c-.06,0-.11.01-.16.04L2.16,34.32c-.1.06-.16.16-.16.27v64.58c0,.11.06.22.16.27l55.92,32.29c.1.06.22.06.32,0l55.92-32.29c.1-.06.16-.16.16-.27V34.6c0-.11-.06-.22-.16-.27L58.4,2.04s-.1-.04-.16-.04Z"/>
</g></svg>`

// ---- Layer 1: Tokenizer --------------------------------------------------
function tokenizePath(d) {
  const chunks = d.match(/[MmZzLlHhVvCcSsQqTtAa]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g)
  if (!chunks) return []

  const tokens = []
  let currentCmd = null

  let i = 0
  while (i < chunks.length) {
    const ch = chunks[i]
    if (/[MmZzLlHhVvCcSsQqTtAa]/.test(ch)) {
      currentCmd = ch
      // Z/z has no args — emit immediately
      if (ch === 'Z' || ch === 'z') {
        tokens.push({ cmd: ch, args: [] })
      }
      i++
    } else if (currentCmd !== null) {
      const cmdUpper = currentCmd.toUpperCase()
      const argCount = ARGS_PER_CMD[cmdUpper] ?? 2
      const args = []
      for (let k = 0; k < argCount && i < chunks.length; k++, i++) {
        args.push(parseFloat(chunks[i]))
      }
      tokens.push({ cmd: currentCmd, args })
      // After M/m, implicit repeat is L/l
      if (currentCmd === 'M') currentCmd = 'L'
      else if (currentCmd === 'm') currentCmd = 'l'
    } else {
      i++
    }
  }
  return tokens
}

// ---- Layer 2: Segment Builder --------------------------------------------
function buildSegments(tokens) {
  const segments = []
  let cx = 0, cy = 0   // current pen position
  let sx = 0, sy = 0   // sub-path start (reset on M/m)
  let prevCp2x = 0, prevCp2y = 0  // second control point of last C/S
  let prevCmdWasCubic = false

  for (const { cmd, args } of tokens) {
    const upper = cmd.toUpperCase()
    const rel = (cmd !== cmd.toUpperCase()) && upper !== 'Z'

    switch (upper) {
      case 'M': {
        cx = rel ? cx + args[0] : args[0]
        cy = rel ? cy + args[1] : args[1]
        sx = cx; sy = cy
        prevCmdWasCubic = false
        break
      }
      case 'L': {
        const x = rel ? cx + args[0] : args[0]
        const y = rel ? cy + args[1] : args[1]
        segments.push({ type: 'line', x0: cx, y0: cy, x1: x, y1: y })
        cx = x; cy = y
        prevCmdWasCubic = false
        break
      }
      case 'H': {
        const x = rel ? cx + args[0] : args[0]
        segments.push({ type: 'line', x0: cx, y0: cy, x1: x, y1: cy })
        cx = x
        prevCmdWasCubic = false
        break
      }
      case 'V': {
        const y = rel ? cy + args[0] : args[0]
        segments.push({ type: 'line', x0: cx, y0: cy, x1: cx, y1: y })
        cy = y
        prevCmdWasCubic = false
        break
      }
      case 'C': {
        const x1 = rel ? cx + args[0] : args[0]
        const y1 = rel ? cy + args[1] : args[1]
        const x2 = rel ? cx + args[2] : args[2]
        const y2 = rel ? cy + args[3] : args[3]
        const x3 = rel ? cx + args[4] : args[4]
        const y3 = rel ? cy + args[5] : args[5]
        segments.push({ type: 'cubic', x0: cx, y0: cy, x1, y1, x2, y2, x3, y3 })
        prevCp2x = x2; prevCp2y = y2
        cx = x3; cy = y3
        prevCmdWasCubic = true
        break
      }
      case 'S': {
        const cp1x = prevCmdWasCubic ? 2 * cx - prevCp2x : cx
        const cp1y = prevCmdWasCubic ? 2 * cy - prevCp2y : cy
        const x2 = rel ? cx + args[0] : args[0]
        const y2 = rel ? cy + args[1] : args[1]
        const x3 = rel ? cx + args[2] : args[2]
        const y3 = rel ? cy + args[3] : args[3]
        segments.push({ type: 'cubic', x0: cx, y0: cy, x1: cp1x, y1: cp1y, x2, y2, x3, y3 })
        prevCp2x = x2; prevCp2y = y2
        cx = x3; cy = y3
        prevCmdWasCubic = true
        break
      }
      case 'Z': {
        if (Math.abs(cx - sx) > 1e-4 || Math.abs(cy - sy) > 1e-4) {
          segments.push({ type: 'line', x0: cx, y0: cy, x1: sx, y1: sy })
        }
        cx = sx; cy = sy
        prevCmdWasCubic = false
        break
      }
    }
  }
  return segments
}

// ---- Layer 3: Arc-Length Samplers ----------------------------------------
function evalCubic(seg, t) {
  const mt = 1 - t
  return {
    x: mt*mt*mt*seg.x0 + 3*mt*mt*t*seg.x1 + 3*mt*t*t*seg.x2 + t*t*t*seg.x3,
    y: mt*mt*mt*seg.y0 + 3*mt*mt*t*seg.y1 + 3*mt*t*t*seg.y2 + t*t*t*seg.y3
  }
}

function sampleLine(seg, step) {
  const pts = []
  const dx = seg.x1 - seg.x0
  const dy = seg.y1 - seg.y0
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len < 1e-6) return pts
  const n = Math.floor(len / step)
  for (let i = 0; i <= n; i++) {
    const t = (i * step) / len
    pts.push({ x: seg.x0 + dx * t, y: seg.y0 + dy * t })
  }
  return pts
}

function sampleCubic(seg, step) {
  // Build a 200-point arc-length LUT at t-step 0.005
  const T_FINE = 0.005
  const lut = [{ arcLen: 0, x: seg.x0, y: seg.y0 }]
  let totalLen = 0
  let prevX = seg.x0, prevY = seg.y0
  for (let t = T_FINE; t <= 1.0 + T_FINE * 0.5; t += T_FINE) {
    const tc = Math.min(t, 1.0)
    const { x, y } = evalCubic(seg, tc)
    const dx = x - prevX, dy = y - prevY
    totalLen += Math.sqrt(dx * dx + dy * dy)
    lut.push({ arcLen: totalLen, x, y })
    prevX = x; prevY = y
  }

  // Emit points at uniform arc-length intervals
  const pts = []
  let nextDist = 0
  let lutIdx = 0
  while (nextDist <= totalLen + 1e-9) {
    while (lutIdx < lut.length - 1 && lut[lutIdx + 1].arcLen < nextDist) lutIdx++
    const a = lut[lutIdx]
    const b = lut[Math.min(lutIdx + 1, lut.length - 1)]
    const span = b.arcLen - a.arcLen
    if (span < 1e-10) {
      pts.push({ x: a.x, y: a.y })
    } else {
      const frac = (nextDist - a.arcLen) / span
      pts.push({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac })
    }
    nextDist += step
  }
  return pts
}

// ---- Layer 4: Full Path Sampler ------------------------------------------
function samplePath(d, step) {
  const tokens   = tokenizePath(d)
  const segments = buildSegments(tokens)
  const points   = []
  for (const seg of segments) {
    if (seg.type === 'line') {
      points.push(...sampleLine(seg, step))
    } else if (seg.type === 'cubic') {
      points.push(...sampleCubic(seg, step))
    }
  }
  return points
}

// ---- Public API ----------------------------------------------------------
export async function sampleLogoPositions(svgUrl, particleCount, W, H) {
  try {
    // 1. Load SVG source — fall back to inline copy on any network error
    let svgSource = FALLBACK_SVG
    try {
      const res = await fetch(svgUrl, { mode: 'cors' })
      if (res.ok) svgSource = await res.text()
    } catch (_) { /* use fallback */ }

    // 2. Extract all d="..." attributes from path elements
    const dStrings = []
    const re = /<path[^>]+\bd="([^"]+)"/g
    let m
    while ((m = re.exec(svgSource)) !== null) dStrings.push(m[1])

    if (dStrings.length === 0) {
      console.warn('[logoSampler] No path elements found in SVG')
      return null
    }

    // 3. Sample all paths at adaptive density
    const STEP_INIT = 0.8
    let allPoints = dStrings.flatMap(d => samplePath(d, STEP_INIT))
    // Re-sample at half step if too sparse to fill half the particle count
    if (allPoints.length < particleCount * 0.5) {
      allPoints = dStrings.flatMap(d => samplePath(d, STEP_INIT * 0.5))
    }

    if (allPoints.length < 50) {
      console.warn('[logoSampler] Too few analytic points:', allPoints.length)
      return null
    }

    // 4. Fisher-Yates shuffle — even spatial coverage before slicing
    for (let i = allPoints.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0
      const tmp = allPoints[i]; allPoints[i] = allPoints[j]; allPoints[j] = tmp
    }
    const sampled = allPoints.slice(0, particleCount)

    // 5. World-space conversion
    //    sx = LOGO_WIDTH / SVG_W  (algebraically equivalent to the old canvas approach)
    //    One SVG unit maps to exactly LOGO_WIDTH / SVG_W world pixels.
    const vW = W * 2  // actual viewport width (W is half-width from orthographic camera)
    const LOGO_WIDTH = vW < 768
      ? Math.round(vW * 0.50)
      : Math.min(350, vW - 48)

    const sx = LOGO_WIDTH / SVG_W  // world px per SVG unit (uniform)
    const sy = sx
    const yOff = H * 0.30          // logo centre at 35svh from viewport top

    // 6. Build particle buffers
    const logoPalette = [
      [0.00, 0.83, 1.00],
      [0.00, 0.75, 0.96],
      [0.00, 0.65, 0.88],
      [0.10, 0.88, 1.00],
      [0.00, 0.55, 0.78],
      [0.18, 0.92, 1.00],
    ]

    const positions = new Float32Array(particleCount * 3)
    const colors    = new Float32Array(particleCount * 3)
    const sizes     = new Float32Array(particleCount)
    const phases    = new Float32Array(particleCount)
    const alphas    = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      if (i < sampled.length) {
        const { x, y } = sampled[i]
        // SVG origin is top-left; centre on (SVG_W/2, SVG_H/2), flip Y for WebGL
        positions[i*3]   = (x - SVG_W / 2) * sx
        positions[i*3+1] = -(y - SVG_H / 2) * sy + yOff
        positions[i*3+2] = (Math.random() - 0.5) * 8
        alphas[i]        = 0.88 + Math.random() * 0.12
      } else {
        // Surplus particles: park far behind, nearly invisible
        positions[i*3]   = (Math.random() - 0.5) * W * 2.6
        positions[i*3+1] = (Math.random() - 0.5) * H * 2.6
        positions[i*3+2] = -400 - Math.random() * 200
        alphas[i]        = 0.02
      }
      const [r, g, b] = logoPalette[Math.floor(Math.random() * logoPalette.length)]
      colors[i*3]   = r; colors[i*3+1] = g; colors[i*3+2] = b
      sizes[i]  = 2.5 + Math.random() * 2.5
      phases[i] = Math.random() * Math.PI * 2
    }

    console.log(`[logoSampler] ${allPoints.length} analytic pts -> ${sampled.length} particles, logo ${LOGO_WIDTH}px wide`)
    return { pos: positions, col: colors, siz: sizes, pha: phases, alp: alphas }

  } catch (err) {
    console.warn('[logoSampler] Error:', err)
    return null
  }
}
