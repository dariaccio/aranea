uniform float uLogoLock;

varying vec3  vColor;
varying float vAlpha;
varying float vExpV;

void main() {
  vec2  uv = gl_PointCoord - 0.5;
  float d  = length(uv);
  if (d > 0.5) discard;

  float core  = pow(1.0 - d * 2.0, 3.2);
  float halo  = pow(max(0.0, 1.0 - d * 2.0), 0.65) * 0.42;
  float bloom = pow(max(0.0, 1.0 - d * 3.2), 5.0) * 0.60;

  vec3 hotCol   = vec3(0.88, 0.97, 1.00);
  vec3 pureCyan = vec3(0.0, 0.831, 1.0);

  vec3 col = mix(vColor, vec3(0.10, 0.88, 1.00), core * 0.48);
  col = mix(col, hotCol, vExpV * 0.72);

  col += vec3(0.0, bloom * 0.83, bloom);
  col += vColor * halo * (1.0 + uLogoLock * 0.5);
  col  = mix(col, pureCyan, uLogoLock * 0.88);

  float alpha = (core + halo * 0.45) * vAlpha;
  alpha *= 1.0 + vExpV * 0.35 + uLogoLock * 0.90;

  gl_FragColor = vec4(col, min(alpha, 1.0));
}
