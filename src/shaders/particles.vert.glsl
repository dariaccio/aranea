attribute float aSize;
attribute vec3  aColor;
attribute float aPhase;
attribute float aAlpha;

uniform float uTime;
uniform float uPixelRatio;
uniform float uExp;
uniform float uBreath;

varying vec3  vColor;
varying float vAlpha;
varying float vExpV;

void main() {
  vColor = aColor;
  vExpV  = uExp;

  // Per-particle breath oscillation — makes the formation feel alive
  float bx = sin(uTime * 0.55 + aPhase)        * uBreath * 0.50;
  float by = cos(uTime * 0.42 + aPhase * 1.31) * uBreath;
  float bz = sin(uTime * 0.28 + aPhase * 2.13) * uBreath * 0.30;

  float shimFreq = 1.6 + 0.6 * fract(aPhase * 0.159);
  float shimmer  = 0.80 + 0.20 * sin(uTime * shimFreq + aPhase);
  float ep       = 1.0 + uExp * 0.8;

  vec3 p = position + vec3(bx, by, bz);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);

  float sz = aSize * shimmer * ep * uPixelRatio;
  gl_PointSize = clamp(sz * (300.0 / max(-mvPosition.z, 0.1)), 1.0, 36.0);
  gl_Position  = projectionMatrix * mvPosition;

  vAlpha = aAlpha;
}
