varying vec3 vColor;
varying float vAlpha;
varying float vDist;

void main() {
  // Radial distance from point center
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Discard outside circle
  if (dist > 0.5) discard;

  // Soft-edge glow: bright core fading to transparent
  float strength = 1.0 - (dist * 2.0);
  strength = pow(strength, 2.2);

  // Inner hot white core
  vec3 coreColor = mix(vColor, vec3(1.0, 1.0, 1.0), strength * 0.55);

  // Additive bloom: boost brightness at center
  float bloom = pow(max(0.0, 1.0 - dist * 2.8), 4.0) * 0.6;
  coreColor += vec3(bloom * 0.4, bloom * 0.8, bloom);

  float alpha = strength * vAlpha;

  gl_FragColor = vec4(coreColor, alpha);
}
