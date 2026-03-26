attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
attribute float aAlpha;

uniform float uTime;
uniform float uPixelRatio;
uniform float uExplosion;

varying vec3 vColor;
varying float vAlpha;
varying float vDist;

void main() {
  vColor = aColor;

  // Shimmer: subtle oscillation per particle
  float shimmer = 0.8 + 0.2 * sin(uTime * 1.8 + aPhase);
  // Pulse during explosion
  float explosionPulse = 1.0 + uExplosion * 0.5;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  // Point size: scale with pixel ratio and distance
  float size = aSize * shimmer * explosionPulse * uPixelRatio;
  gl_PointSize = size * (300.0 / max(-mvPosition.z, 0.1));
  gl_PointSize = clamp(gl_PointSize, 1.0, 32.0);

  gl_Position = projectionMatrix * mvPosition;

  // Alpha based on depth (particles far back fade out)
  float depthFade = smoothstep(-600.0, -100.0, mvPosition.z);
  vAlpha = aAlpha * depthFade;
  vDist = -mvPosition.z;
}
