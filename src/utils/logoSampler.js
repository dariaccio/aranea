// SVG viewBox dimensions — used to correct the letterboxed canvas layout
const SVG_W = 116.48
const SVG_H = 133.78

/**
 * Samples pixel positions from an SVG to use as particle target formation.
 * Logo is rendered at exactly 350px wide, positioned just above the CTA text.
 * Falls back to a DOM canvas if OffscreenCanvas is unavailable (Safari < 16.4).
 */
export async function sampleLogoPositions(svgUrl, particleCount, W, H) {
  const CANVAS_SIZE = 1024  // max resolution for sharpest particle definition
  const LOGO_WIDTH  = 350   // fixed pixel width in world/screen space

  try {
    // 1. Fetch SVG source text
    const response = await fetch(svgUrl, { mode: 'cors' })
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`)
    const svgText = await response.text()

    // 2. Inject white fill/stroke so all paths render white on black
    const coloredSvg = svgText
      .replace(/<svg/, '<svg style="background:#000"')
      .replace(/fill\s*:\s*[^;}"]+/g, 'fill:white')
      .replace(/stroke\s*:\s*[^;}"]+/g, 'stroke:white')
      .replace(/stroke-width\s*:\s*[^;}"]+/g, 'stroke-width:1.5px')
      .replace(/stroke-width="[^"]*"/g, 'stroke-width="1.5"')
      .replace(/fill="(?!none)[^"]*"/g, 'fill="white"')
      .replace(/stroke="(?!none)[^"]*"/g, 'stroke="white"')

    const blob    = new Blob([coloredSvg], { type: 'image/svg+xml' })
    const blobUrl = URL.createObjectURL(blob)

    // 3. Create canvas (with Safari fallback)
    let canvas, ctx
    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
      ctx    = canvas.getContext('2d')
    } else {
      canvas = document.createElement('canvas')
      canvas.width  = CANVAS_SIZE
      canvas.height = CANVAS_SIZE
      canvas.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden'
      document.body.appendChild(canvas)
      ctx = canvas.getContext('2d')
    }

    // 4. Draw SVG onto canvas
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
        resolve()
      }
      img.onerror = reject
      img.src = blobUrl
    })

    URL.revokeObjectURL(blobUrl)

    // 5. Read pixel data
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    const pixels    = imageData.data

    // 6. Collect bright pixel positions — sample every pixel for maximum fidelity
    const candidates = []
    const THRESHOLD  = 28

    for (let y = 0; y < CANVAS_SIZE; y++) {
      for (let x = 0; x < CANVAS_SIZE; x++) {
        const idx = (y * CANVAS_SIZE + x) * 4
        const brightness = Math.max(pixels[idx], pixels[idx + 1], pixels[idx + 2])
        if (brightness > THRESHOLD) {
          candidates.push({ x, y, brightness })
        }
      }
    }

    if (canvas.parentNode) canvas.parentNode.removeChild(canvas)

    if (candidates.length < 50) {
      console.warn('[logoSampler] Too few bright pixels found:', candidates.length)
      return null
    }

    // 7. Fisher-Yates shuffle for even spatial distribution
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = candidates[i]; candidates[i] = candidates[j]; candidates[j] = tmp
    }
    const sampled = candidates.slice(0, particleCount)

    // 8. Compute scale — SVG letterboxes horizontally on the square canvas.
    // contentW is the actual pixel width of the SVG content on the canvas.
    const svgAR    = SVG_W / SVG_H              // 0.871 (portrait)
    const contentW = CANVAS_SIZE * svgAR        // pixels of actual SVG content
    const xOffset  = (CANVAS_SIZE - contentW) / 2  // left margin of letterbox

    const sx = LOGO_WIDTH / contentW           // scale to reach 350px world width
    const sy = sx                              // uniform scale

    // 9. Y offset: position logo centre at 35svh from viewport top
    // World Y = 0 is viewport centre; positive = up.
    // 35svh from top = 15% of vH above centre = H * 0.30
    const yOff = H * 0.30

    // 10. Logo-specific colour palette (#00d4ff family)
    const logoPalette = [
      [0.00, 0.83, 1.00],  // #00D4FF
      [0.00, 0.75, 0.96],  // #00BFEF
      [0.00, 0.65, 0.88],  // #00A6E0
      [0.10, 0.88, 1.00],  // #1AE0FF
      [0.00, 0.55, 0.78],  // #008CC7
      [0.18, 0.92, 1.00],  // #2EEBFF
    ]

    const positions = new Float32Array(particleCount * 3)
    const colors    = new Float32Array(particleCount * 3)
    const sizes     = new Float32Array(particleCount)
    const phases    = new Float32Array(particleCount)
    const alphas    = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      if (i < sampled.length) {
        const { x, y, brightness } = sampled[i]
        positions[i*3]   = (x - xOffset - contentW / 2) * sx
        positions[i*3+1] = -(y - CANVAS_SIZE / 2) * sy + yOff
        positions[i*3+2] = (Math.random() - 0.5) * 8
        alphas[i]        = 0.88 + Math.random() * 0.12
      } else {
        // Surplus particles park far behind
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

    return { pos: positions, col: colors, siz: sizes, pha: phases, alp: alphas }

  } catch (err) {
    console.warn('[logoSampler] Error sampling logo:', err)
    return null
  }
}
