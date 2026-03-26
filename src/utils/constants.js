// Performance tiers based on device capability
export function getPerformanceTier() {
  const isMobile = window.innerWidth < 768
  const isLowEnd = navigator.hardwareConcurrency <= 2 ||
    (!window.matchMedia('(min-resolution: 1.5dppx)').matches && isMobile)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) return 'minimal'
  if (isMobile && isLowEnd) return 'low'
  if (isMobile) return 'mid'
  return 'high'
}

export const PARTICLE_COUNTS = {
  high:    4000,
  mid:     1600,
  low:     700,
  minimal: 300
}

export const PARTICLE_CONFIG = {
  high:    { shimmer: true,  pointer: true,  physicsEveryFrame: true  },
  mid:     { shimmer: true,  pointer: true,  physicsEveryFrame: true  },
  low:     { shimmer: false, pointer: false, physicsEveryFrame: false },
  minimal: { shimmer: false, pointer: false, physicsEveryFrame: false }
}

// Spring physics constants
export const SPRING_STIFFNESS = 0.072
export const SPRING_DAMPING   = 0.76

// Pointer repulsion
export const REPULSION_RADIUS   = 190   // world units
export const REPULSION_STRENGTH = 7.5

// Explosion impulse
export const EXPLOSION_BASE = 22
export const EXPLOSION_Z    = 10

// Particle appearance
export const PARTICLE_SIZE_MIN = 1.5
export const PARTICLE_SIZE_MAX = 4.2

// Colors: electric blue / cyan / neon azure gradient
export const PARTICLE_COLORS = [
  [0.0,  0.83, 1.0 ],  // #00D4FF core cyan
  [0.0,  0.70, 0.88],  // #00B3E0 mid blue
  [0.23, 0.51, 0.97],  // #3B82F6 electric blue
  [0.35, 0.75, 1.0 ],  // #59BFFF light azure
  [0.0,  0.60, 0.80],  // #0099CC deep cyan
  [0.12, 0.47, 0.85],  // #1E78D9 royal blue
  [0.55, 0.88, 1.0 ],  // #8CE0FF pale blue
]
