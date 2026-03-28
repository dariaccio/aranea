/**
 * Samples stroke-edge pixels from the Aranea SVG to build a particle formation.
 *
 * Rendering strategy (matches local standalone.html behaviour):
 *   - SVG is drawn onto a transparent OffscreenCanvas at fixed 1024 × 1024 px.
 *   - ALL fills are stripped → only stroke outlines are rendered.
 *   - Pixels are accepted only when alpha > ALPHA_THRESHOLD (200).
 *     This skips every anti-aliased semi-transparent fringe pixel and every
 *     filled interior region, giving a sharp hollow-center logo.
 *   - Fisher-Yates shuffle before slicing ensures even spatial coverage.
 *   - Scaling is viewBox-aware: the portrait SVG (116.48 × 133.78) letterboxes
 *     horizontally inside the square canvas, so xOffset is subtracted to
 *     centre the world-space result correctly.
 */

const SVG_W = 116.48
const SVG_H = 133.78

// Inline fallback – used when the network request fails.
// Fills are already set to none so only strokes contribute pixels.
const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.48 133.78">
<defs><style>
  .c1{fill:none;stroke:white;stroke-width:3}
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

// ─── Prepare SVG source: strip all fills, keep strokes only ───────────────
function prepareStrokeOnlySvg(raw) {
  return raw
    // Remove any background color on the root element
    .replace(/(<svg[^>]*)\sstyle="[^"]*"/,  '$1')
    .replace(/(<svg[^>]*)>/,                '$1>')
    // CSS class rules: force fill:none everywhere
    .replace(/fill\s*:\s*(?!none)[^;}"]+/g, 'fill:none')
    // Inline fill attributes: force fill="none"
    .replace(/fill="(?!none)[^"]*"/g,       'fill="none"')
    // Keep strokes white
    .replace(/stroke\s*:\s*[^;}"]+/g,       'stroke:white')
    .replace(/stroke="(?!none)[^"]*"/g,     'stroke="white"')
    // Keep stroke-width as-is (do not widen — preserves original proportions)
}

export async function sampleLogoPositions(svgUrl, particleCount, W, H) {
  // Canvas resolution: high but not DPR-scaled (sampling canvas, not display canvas)
  const SZ             = 1024
  const ALPHA_THRESHOLD = 200   // only fully-opaque stroke pixels; skips anti-aliased fringe
  const vW             = W * 2
  const LOGO_WIDTH     = Math.min(350, vW - 48)   // responsive: max 350px, 24px margins

  try {
    // ── 1. Load SVG source ────────────────────────────────────────────────
    let svgSource = prepareStrokeOnlySvg(FALLBACK_SVG)

    try {
      // Wait for the full SVG text before proceeding
      const res = await fetch(svgUrl, { mode: 'cors' })
      if (res.ok) {
        const text = await res.text()
        svgSource = prepareStrokeOnlySvg(text)
      }
    } catch (_) { /* network failed – use inline fallback */ }

    // ── 2. Build Blob URL from prepared SVG ──────────────────────────────
    const blob    = new Blob([svgSource], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)

    // ── 3. Create offscreen canvas (transparent – NO background fill) ─────
    let canvas, ctx
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(SZ, SZ)
      ctx    = canvas.getContext('2d')
    } else {
      canvas        = document.createElement('canvas')
      canvas.width  = SZ
      canvas.height = SZ
      canvas.style.cssText = 'position:absolute;left:-9999px;visibility:hidden'
      document.body.appendChild(canvas)
      ctx = canvas.getContext('2d')
    }

    // ── 4. Wait for the SVG image to be fully loaded, then draw ──────────
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Transparent background – do NOT fillRect with any colour.
        // The browser renders the SVG with its natural alpha channel intact.
        ctx.clearRect(0, 0, SZ, SZ)
        ctx.drawImage(img, 0, 0, SZ, SZ)
        resolve()
      }
      img.onerror = reject
      img.src = blobUrl
    })

    URL.revokeObjectURL(blobUrl)
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas)

    // ── 5. Collect only fully-opaque stroke pixels ─────────────────────
    // Reading the alpha channel avoids sampling:
    //   • anti-aliased semi-transparent fringe pixels
    //   • any filled interior regions (all fills were stripped in step 1)
    const pixels  = ctx.getImageData(0, 0, SZ, SZ).data
    const cands   = []

    for (let y = 0; y < SZ; y++) {
      for (let x = 0; x < SZ; x++) {
        const a = pixels[(y * SZ + x) * 4 + 3]   // alpha channel
        if (a > ALPHA_THRESHOLD) cands.push({ x, y })
      }
    }

    if (cands.length < 50) {
      console.warn('[logoSampler] Too few opaque pixels found:', cands.length)
      return null
    }

    // ── 6. Fisher-Yates shuffle → even spatial distribution ──────────────
    for (let i = cands.length - 1; i > 0; i--) {
      const j   = Math.floor(Math.random() * (i + 1))
      const tmp = cands[i]; cands[i] = cands[j]; cands[j] = tmp
    }
    const sampled = cands.slice(0, particleCount)

    // ── 7. Viewbox-aware scaling ──────────────────────────────────────────
    // The portrait SVG (116.48 × 133.78) letterboxes horizontally inside the
    // square canvas: content fills the full height and is centred with equal
    // left/right margins.
    const svgAR   = SVG_W / SVG_H              // ≈ 0.871
    const contentW = SZ * svgAR               // actual pixel width of SVG content
    const xOffset  = (SZ - contentW) / 2      // left letterbox margin

    const sx = LOGO_WIDTH / contentW          // uniform scale → LOGO_WIDTH in world px
    const sy = sx

    // Logo centre sits at 35 svh from viewport top (= H × 0.30 above world centre)
    const yOff = H * 0.30

    // ── 8. Build particle buffers ─────────────────────────────────────────
    const logoPalette = [
      [0.00, 0.83, 1.00],   // #00d4ff
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
        positions[i*3]   = (x - xOffset - contentW / 2) * sx
        positions[i*3+1] = -(y - SZ / 2) * sy + yOff
        positions[i*3+2] = (Math.random() - 0.5) * 8
        alphas[i]        = 0.88 + Math.random() * 0.12
      } else {
        // Surplus particles park far behind the formation
        positions[i*3]   = (Math.random() - 0.5) * W * 2.6
        positions[i*3+1] = (Math.random() - 0.5) * H * 2.6
        positions[i*3+2] = -400 - Math.random() * 200
        alphas[i]        = 0.02
      }

      const [r, g, b] = logoPalette[Math.floor(Math.random() * logoPalette.length)]
      colors[i*3]   = r
      colors[i*3+1] = g
      colors[i*3+2] = b
      sizes[i]  = 2.5 + Math.random() * 2.5
      phases[i] = Math.random() * Math.PI * 2
    }

    console.log(`[logoSampler] ${cands.length} opaque pixels → ${sampled.length} particles`)
    return { pos: positions, col: colors, siz: sizes, pha: phases, alp: alphas }

  } catch (err) {
    console.warn('[logoSampler] Error:', err)
    return null
  }
}
