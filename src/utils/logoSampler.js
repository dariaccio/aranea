import { PARTICLE_COLORS, PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX } from './constants.js'

/**
 * Samples pixel positions from an SVG to use as particle target formation.
 * Falls back to a DOM canvas if OffscreenCanvas is unavailable (Safari < 16.4).
 */
export async function sampleLogoPositions(svgUrl, particleCount, W, H) {
  const CANVAS_SIZE = 512

  try {
    // 1. Fetch SVG source text
    const response = await fetch(svgUrl, { mode: 'cors' })
    if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`)
    const svgText = await response.text()

    // 2. Inject white fill/stroke so all paths render white on black
    const coloredSvg = svgText
      .replace(/<svg/, '<svg style="background:#000"')
      // Replace CSS class fill and stroke definitions in <style> blocks
      .replace(/fill\s*:\s*[^;}"]+/g, 'fill:white')
      .replace(/stroke\s*:\s*[^;}"]+/g, 'stroke:white')
      // Also widen strokes for better sampling coverage at 512px
      .replace(/stroke-width\s*:\s*[^;}"]+/g, 'stroke-width:3px')
      .replace(/stroke-width="[^"]*"/g, 'stroke-width="3"')
      // Replace direct attributes
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

    // 6. Collect bright pixel positions
    const candidates = []
    const THRESHOLD  = 30  // pixels brighter than this

    // Sample every 2nd pixel for performance
    for (let y = 0; y < CANVAS_SIZE; y += 2) {
      for (let x = 0; x < CANVAS_SIZE; x += 2) {
        const idx = (y * CANVAS_SIZE + x) * 4
        // Use max of RGB channels to handle colored SVGs
        const brightness = Math.max(pixels[idx], pixels[idx + 1], pixels[idx + 2])
        if (brightness > THRESHOLD) {
          candidates.push({ x, y, brightness })
        }
      }
    }

    // Cleanup DOM canvas if used
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas)

    if (candidates.length < 50) {
      console.warn('[logoSampler] Too few bright pixels found:', candidates.length, '– falling back')
      return null
    }

    // 7. Subsample to particle count (evenly distributed)
    const step    = Math.max(1, Math.floor(candidates.length / particleCount))
    const sampled = candidates.filter((_, i) => i % step === 0).slice(0, particleCount)

    // 8. Convert pixel coords to world space centered on viewport
    const logoScale = 0.58
    const scaleX = (W * 2 * logoScale) / CANVAS_SIZE
    const scaleY = (H * 2 * logoScale) / CANVAS_SIZE

    const positions = new Float32Array(particleCount * 3)
    const colors    = new Float32Array(particleCount * 3)
    const sizes     = new Float32Array(particleCount)
    const phases    = new Float32Array(particleCount)
    const alphas    = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      if (i < sampled.length) {
        const { x, y, brightness } = sampled[i]
        positions[i*3]   = (x - CANVAS_SIZE / 2) * scaleX
        positions[i*3+1] = -(y - CANVAS_SIZE / 2) * scaleY  // flip Y
        positions[i*3+2] = (Math.random() - 0.5) * 40
        alphas[i] = 0.6 + (brightness / 255) * 0.4
      } else {
        // Extra particles scatter behind formation
        positions[i*3]   = (Math.random() - 0.5) * W * 2.5
        positions[i*3+1] = (Math.random() - 0.5) * H * 2.5
        positions[i*3+2] = -300 - Math.random() * 200
        alphas[i] = 0.05
      }

      const palette   = PARTICLE_COLORS
      const colorIdx  = Math.floor(Math.random() * palette.length)
      const [r, g, b] = palette[colorIdx]
      colors[i*3]     = r
      colors[i*3+1]   = g
      colors[i*3+2]   = b

      sizes[i]  = PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN)
      phases[i] = Math.random() * Math.PI * 2
    }

    return { pos: positions, col: colors, siz: sizes, pha: phases, alp: alphas }

  } catch (err) {
    console.warn('[logoSampler] Error sampling logo:', err)
    return null
  }
}
