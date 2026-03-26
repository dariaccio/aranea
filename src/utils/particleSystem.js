import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import vertexShader   from '../shaders/particles.vert.glsl'
import fragmentShader from '../shaders/particles.frag.glsl'
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

// ─── Module state ──────────────────────────────────────────────────────────
let renderer, scene, camera, points, material, geometry
let clock, rafId
let particleCount = 0
let tier          = 'high'
let config        = {}
let frameCounter  = 0
let activeSection = 0

// Buffer arrays
let positions, targets, velocities, colors, sizes, phases, alphas

// Viewport
let vW = window.innerWidth
let vH = window.innerHeight

// Pointer (NDC -1..1)
const pointer = { x: 0, y: 0 }

// Formations cache
const formationCache = {}
let logoFormation = null

// Explosion uniform state
let explosionLevel = 0

// ─── Init ──────────────────────────────────────────────────────────────────
export function initParticleSystem(canvas) {
  tier   = getPerformanceTier()
  config = PARTICLE_CONFIG[tier]
  particleCount = PARTICLE_COUNTS[tier]

  // Disable GSAP's own RAF — we call gsap.updateRoot manually
  gsap.ticker.remove(gsap.updateRoot)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setSize(vW, vH)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x06080d, 1)

  // Scene
  scene = new THREE.Scene()

  // Orthographic camera: world units == screen pixels at z=0
  const aspect = vW / vH
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
  geometry.setAttribute('position',   new THREE.BufferAttribute(positions,  3))
  geometry.setAttribute('aColor',     new THREE.BufferAttribute(colors,     3))
  geometry.setAttribute('aSize',      new THREE.BufferAttribute(sizes,      1))
  geometry.setAttribute('aPhase',     new THREE.BufferAttribute(phases,     1))
  geometry.setAttribute('aAlpha',     new THREE.BufferAttribute(alphas,     1))

  // Material
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uExplosion:  { value: 0 }
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
    vertexColors: false
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)

  clock = new THREE.Clock()

  // Set initial formation (hero)
  applyFormation(0)
  // Copy targets to positions (no spring on first frame)
  positions.set(targets)
  geometry.attributes.position.needsUpdate = true

  // Start loop
  tick()

  // Resize handler
  window.addEventListener('resize', onResize)

  // Pre-sample logo formation in background
  loadLogoFormation()

  return () => destroy()
}

// ─── Tick (main loop) ──────────────────────────────────────────────────────
function tick() {
  rafId = requestAnimationFrame(tick)

  const timestamp = performance.now()
  const delta     = Math.min(clock.getDelta(), 0.05)
  const elapsed   = clock.getElapsedTime()

  // Advance GSAP tweens
  gsap.updateRoot(timestamp * 0.001)

  // Physics (skip every other frame on low tier)
  frameCounter++
  const shouldRunPhysics = config.physicsEveryFrame || frameCounter % 2 === 0

  if (shouldRunPhysics) {
    updatePhysics(delta)
    if (config.pointer) applyPointerRepulsion()
  }

  // Decay explosion uniform
  explosionLevel *= 0.93
  material.uniforms.uExplosion.value  = explosionLevel
  material.uniforms.uTime.value       = elapsed

  renderer.render(scene, camera)
}

// ─── Spring physics ────────────────────────────────────────────────────────
function updatePhysics(delta) {
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    for (let axis = 0; axis < 3; axis++) {
      const idx = i3 + axis
      const dx  = targets[idx] - positions[idx]
      velocities[idx] += dx * SPRING_STIFFNESS
      velocities[idx] *= SPRING_DAMPING
      positions[idx]  += velocities[idx]
    }
  }
  geometry.attributes.position.needsUpdate = true
}

// ─── Pointer repulsion ─────────────────────────────────────────────────────
function applyPointerRepulsion() {
  const px = pointer.x * vW / 2
  const py = pointer.y * vH / 2
  const rSq = REPULSION_RADIUS * REPULSION_RADIUS

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    const dx = positions[i3]     - px
    const dy = positions[i3 + 1] - py
    const dSq = dx * dx + dy * dy

    if (dSq < rSq && dSq > 0.01) {
      const dist   = Math.sqrt(dSq)
      const factor = (1.0 - dist / REPULSION_RADIUS) * REPULSION_STRENGTH
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

// ─── Apply a formation to targets ─────────────────────────────────────────
export function setFormation(index) {
  activeSection = index
  applyFormation(index)
}

function applyFormation(index) {
  let formation

  if (index === 7 && logoFormation) {
    formation = logoFormation
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

// ─── Logo formation loader ─────────────────────────────────────────────────
async function loadLogoFormation() {
  const svgUrl = '/assets/risorsa5ara.svg'
  try {
    const result = await sampleLogoPositions(svgUrl, particleCount, vW / 2, vH / 2)
    if (result) {
      logoFormation = result
      console.log('[ParticleSystem] Logo formation ready.')
      // When logo formation becomes available and we are on that section, apply it
      if (activeSection === 7) {
        applyFormation(7)
      }
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

  // Invalidate formation cache on resize (positions are viewport-relative)
  Object.keys(formationCache).forEach(k => delete formationCache[k])
}

// ─── Cleanup ───────────────────────────────────────────────────────────────
function destroy() {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', onResize)
  geometry.dispose()
  material.dispose()
  renderer.dispose()
}
