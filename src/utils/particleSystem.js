import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import vertexShader   from '../shaders/particles.vert.glsl'
import fragmentShader from '../shaders/particles.frag.glsl'
import { getLenis } from '../hooks/useLenis.js'
import {
  getPerformanceTier,
  PARTICLE_COUNTS,
  PARTICLE_CONFIG,
  SPRING_STIFFNESS,
  SPRING_DAMPING,
  REPULSION_RADIUS,
  REPULSION_STRENGTH,
  EXPLOSION_BASE,
  EXPLOSION_Z
} from './constants.js'
import { generateFormation } from './formations.js'
import { sampleLogoPositions } from './logoSampler.js'

gsap.registerPlugin(ScrollTrigger)

// Logo-lock spring constants
const K_LOGO = 0.20
const D_LOGO = 0.83

// ─── Module state ──────────────────────────────────────────────────────────
let renderer, scene, camera, points, material, geometry
let clock, rafId, lenis
let particleCount = 0
let tier          = 'high'
let config        = {}
let frameCounter  = 0

// Buffer arrays
let positions, targets, velocities, colors, sizes, phases, alphas

// Viewport
let vW = window.innerWidth
let vH = window.innerHeight

// Pointer (NDC -1..1)
const pointer = { x: 0, y: 0 }

function normalizeScrollEvent(_e) {
  // reserved for future scroll-velocity use
}

// Formations cache
const formationCache = {}
let logoFormation = null
let activeSection = 0

// Explosion uniform state
let explosionLevel = 0

// Logo fade state
let logoFade = { value: 0 }

// Breath oscillation amplitude (matches standalone.html steady-state value)
let breathAmp = 0

// CTA phase state
let ctaActive = false
let ctaPhase  = 0   // 0=idle, 1=scatter, 2=converge, 3=locked
let ctaK      = 0
let ctaD      = SPRING_DAMPING
let ctaTimer  = null
let ctaTimer2 = null

// ─── Init ──────────────────────────────────────────────────────────────────
export function initParticleSystem(canvas, lenisInstance) {
  lenis = lenisInstance

  tier   = getPerformanceTier()
  config = PARTICLE_CONFIG[tier]
  particleCount = PARTICLE_COUNTS[tier]

  // Disable GSAP's own RAF — we call gsap.updateRoot manually
  gsap.ticker.remove(gsap.updateRoot)

  // Renderer — alpha:true so page content shows through
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(vW, vH)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  // Scene
  scene = new THREE.Scene()

  // Orthographic camera: world units == screen pixels at z=0
  camera = new THREE.OrthographicCamera(
    -vW / 2, vW / 2,
     vH / 2, -vH / 2,
    1, 2000
  )
  camera.position.z = 500

  // Allocate buffers
  positions  = new Float32Array(particleCount * 3)
  targets    = new Float32Array(particleCount * 3)
  velocities = new Float32Array(particleCount * 3)
  colors     = new Float32Array(particleCount * 3)
  sizes      = new Float32Array(particleCount)
  phases     = new Float32Array(particleCount)
  alphas     = new Float32Array(particleCount)

  // Build geometry
  geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor',   new THREE.BufferAttribute(colors,    3))
  geometry.setAttribute('aSize',    new THREE.BufferAttribute(sizes,     1))
  geometry.setAttribute('aPhase',   new THREE.BufferAttribute(phases,    1))
  geometry.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas,    1))

  // Material
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uExp:        { value: 0 },
      uLogoLock:   { value: 0 },
      uBreath:     { value: 0 }
    },
    transparent:  true,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
    vertexColors: false
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)

  clock = new THREE.Clock()

  // Set initial formation (hero)
  applyFormation(0)
  positions.set(targets)
  geometry.attributes.position.needsUpdate = true

  // Start loop
  tick()

  // Resize handler
  window.addEventListener('resize', onResize)

  window.addEventListener('scroll', normalizeScrollEvent, { passive: true })
  if (lenis) lenis.on('scroll', normalizeScrollEvent)

  // Pre-sample logo formation in background
  loadLogoFormation()

  return () => destroy()
}

// ─── Tick (main loop) ──────────────────────────────────────────────────────
function tick() {
  rafId = requestAnimationFrame(tick)

  // Lazy lenis pickup — child effect runs before parent's useLenis effect
  if (!lenis) {
    lenis = getLenis()
    if (lenis) lenis.on('scroll', normalizeScrollEvent)
  }

  const timestamp = performance.now()
  const delta     = Math.min(clock.getDelta(), 0.05)
  const elapsed   = clock.getElapsedTime()

  if (lenis) lenis.raf(timestamp)
  gsap.updateRoot(timestamp * 0.001)

  // Update logo fade alphas if on logo section
  if (activeSection === 7 && logoFormation) {
    const alphasSrc = logoFormation.alp
    for (let i = 0; i < particleCount; i++) {
      alphas[i] = alphasSrc[i] * logoFade.value
    }
    geometry.attributes.aAlpha.needsUpdate = true
  }

  frameCounter++
  const shouldRunPhysics = config.physicsEveryFrame || frameCounter % 2 === 0

  if (shouldRunPhysics) {
    updatePhysics(delta)
    if (config.pointer) applyPointerRepulsion()
  }

  explosionLevel *= 0.93
  material.uniforms.uExp.value  = explosionLevel
  material.uniforms.uTime.value = elapsed

  // Breath: ramp up to 18 during normal sections, suppress during CTA logo lock
  const breathTarget = (ctaActive && ctaPhase >= 2) ? 0 : 18
  breathAmp += (breathTarget - breathAmp) * 0.025
  material.uniforms.uBreath.value = breathAmp

  // Animate uLogoLock uniform
  const lockTarget = (ctaActive && ctaPhase >= 3) ? 1.0 : 0.0
  material.uniforms.uLogoLock.value += (lockTarget - material.uniforms.uLogoLock.value) * 0.04

  renderer.render(scene, camera)
}

// ─── Spring physics ────────────────────────────────────────────────────────
function updatePhysics(delta) {
  let K = SPRING_STIFFNESS
  let D = SPRING_DAMPING

  if (ctaActive) {
    // Smoothly lerp toward target K/D for each CTA phase (~0.9s ramp at 60fps)
    const tgtK = [0, 0.010, 0.048, K_LOGO * 1.4][ctaPhase] || K_LOGO
    const tgtD = [0, 0.95,  0.89,  0.91        ][ctaPhase] || D_LOGO
    ctaK += (tgtK - ctaK) * 0.018
    ctaD += (tgtD - ctaD) * 0.018
    K = ctaK; D = ctaD
  }

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    for (let axis = 0; axis < 3; axis++) {
      const idx = i3 + axis
      const dx  = targets[idx] - positions[idx]
      velocities[idx] += dx * K
      velocities[idx] *= D
      positions[idx]  += velocities[idx]
    }
  }
  geometry.attributes.position.needsUpdate = true
}

// ─── Pointer repulsion ─────────────────────────────────────────────────────
function applyPointerRepulsion() {
  const px  = pointer.x * vW / 2
  const py  = pointer.y * vH / 2
  const rSq = REPULSION_RADIUS * REPULSION_RADIUS
  const scale = (ctaActive && ctaPhase >= 3) ? 0.22 : 1.0

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const dx  = positions[i3]     - px
    const dy  = positions[i3 + 1] - py
    const dSq = dx * dx + dy * dy

    if (dSq < rSq && dSq > 0.01) {
      const dist   = Math.sqrt(dSq)
      const factor = (1.0 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH * scale
      velocities[i3]     += (dx / dist) * factor
      velocities[i3 + 1] += (dy / dist) * factor
    }
  }
}

// ─── Explosion burst ───────────────────────────────────────────────────────
export function triggerExplosion(intensity = 1.0) {
  const burst = EXPLOSION_BASE * Math.max(0.4, Math.min(intensity, 2.5))
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    velocities[i3]     += (Math.random() - 0.5) * burst
    velocities[i3 + 1] += (Math.random() - 0.5) * burst
    velocities[i3 + 2] += (Math.random() - 0.5) * EXPLOSION_Z
  }
  explosionLevel = Math.min(1.0, intensity * 0.6)
}

// ─── Scatter particles to field ─────────────────────────────────────────────
function _scatterToField(multiplier = 1.0) {
  for (let i = 0; i < particleCount; i++) {
    targets[i*3]   = (Math.random() - 0.5) * vW * multiplier
    targets[i*3+1] = (Math.random() - 0.5) * vH * multiplier
    targets[i*3+2] = (Math.random() - 0.5) * 400
  }
}

// ─── CTA enter / exit ──────────────────────────────────────────────────────
export function enterCTA() {
  if (ctaActive) return
  ctaActive      = true
  ctaPhase       = 1
  logoFade.value = 0

  _scatterToField(3.8)
  triggerExplosion(3.8)

  // Phase 2: weak spring pulls toward logo
  clearTimeout(ctaTimer)
  ctaTimer = setTimeout(() => {
    ctaPhase = 2
    const lf = logoFormation || generateFormation(0, particleCount, vW/2, vH/2)
    targets.set(lf.pos)
    colors.set(lf.col)
    sizes.set(lf.siz)
    phases.set(lf.pha)
    alphas.set(lf.alp)
    geometry.attributes.aColor.needsUpdate = true
    geometry.attributes.aSize.needsUpdate  = true
    geometry.attributes.aPhase.needsUpdate = true
    geometry.attributes.aAlpha.needsUpdate = true
    logoFade.value = 1
  }, 700)

  // Phase 3: strong spring locks formation
  clearTimeout(ctaTimer2)
  ctaTimer2 = setTimeout(() => {
    ctaPhase = 3
    const lf2 = logoFormation || generateFormation(0, particleCount, vW/2, vH/2)
    targets.set(lf2.pos)
    geometry.attributes.aColor.needsUpdate = true
  }, 1600)
}

export function exitCTA() {
  if (!ctaActive) return
  ctaActive = false
  ctaPhase  = 0
  ctaK      = 0
  ctaD      = SPRING_DAMPING
  clearTimeout(ctaTimer)
  clearTimeout(ctaTimer2)
}

// ─── Apply a formation to targets ──────────────────────────────────────────
export function setFormation(index) {
  activeSection = index
  logoFade.value = 1

  // CTA section is handled by enterCTA/exitCTA — don't override targets here
  if (index !== 7) {
    ctaActive = false
    ctaPhase  = 0
    ctaK      = 0
    ctaD      = SPRING_DAMPING
    applyFormation(index)
  }
}

function applyFormation(index) {
  let formation

  if (index === 7 && logoFormation) {
    formation = logoFormation
  } else if (index === 7) {
    // Logo not ready yet — use nebula as placeholder
    formation = generateFormation(0, particleCount, vW / 2, vH / 2)
  } else if (formationCache[index]) {
    formation = formationCache[index]
  } else {
    formation = generateFormation(index, particleCount, vW / 2, vH / 2)
    formationCache[index] = formation
  }

  targets.set(formation.pos)
  colors.set(formation.col)
  sizes.set(formation.siz)
  phases.set(formation.pha)
  alphas.set(formation.alp)

  geometry.attributes.aColor.needsUpdate = true
  geometry.attributes.aSize.needsUpdate  = true
  geometry.attributes.aPhase.needsUpdate = true
  geometry.attributes.aAlpha.needsUpdate = true
}

// ─── Logo formation loader ──────────────────────────────────────────────────
async function loadLogoFormation() {
  const svgUrl = '/assets/risorsa5ara.svg'
  try {
    const result = await sampleLogoPositions(svgUrl, particleCount, vW / 2, vH / 2)
    if (result) {
      logoFormation = result
      console.log('[ParticleSystem] Logo formation ready.')
    }
  } catch (err) {
    console.warn('[ParticleSystem] Logo sampling failed:', err)
  }
}

// ─── Pointer update ────────────────────────────────────────────────────────
export function updatePointer(x, y) {
  pointer.x = x
  pointer.y = y
}

// ─── Resize ────────────────────────────────────────────────────────────────
function onResize() {
  vW = window.innerWidth
  vH = window.innerHeight

  renderer.setSize(vW, vH)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)

  camera.left   = -vW / 2
  camera.right  =  vW / 2
  camera.top    =  vH / 2
  camera.bottom = -vH / 2
  camera.updateProjectionMatrix()

  Object.keys(formationCache).forEach(k => delete formationCache[k])
}

// ─── Cleanup ───────────────────────────────────────────────────────────────
function destroy() {
  cancelAnimationFrame(rafId)
  clearTimeout(ctaTimer)
  clearTimeout(ctaTimer2)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', normalizeScrollEvent)
  if (lenis) lenis.off('scroll', normalizeScrollEvent)
  geometry.dispose()
  material.dispose()
  renderer.dispose()
}
