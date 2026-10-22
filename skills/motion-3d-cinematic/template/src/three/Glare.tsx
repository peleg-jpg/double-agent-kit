import React, {useMemo} from 'react';
import {AdditiveBlending, BufferGeometry, Color, ShaderMaterial} from 'three';

// Glass glare on a screen: a faint static diagonal reflection plus a moving light
// band (progress 0..1, or -1 for no band). Additive, so it only adds light.
const vertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fragment = /* glsl */ `
uniform float uProgress;
uniform float uStatic;
uniform float uBand;
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  float d = vUv.x * 0.7 + vUv.y * 0.55;
  float a = uStatic * smoothstep(1.25, 0.35, d) * 0.6;
  if (uProgress >= 0.0) {
    float c = mix(-0.35, 1.6, uProgress);
    a += uBand * exp(-pow((d - c) / 0.07, 2.0));
    a += uBand * 0.45 * exp(-pow((d - c + 0.16) / 0.025, 2.0));
  }
  gl_FragColor = vec4(uColor * a, a);
}`;

export const Glare: React.FC<{geometry: BufferGeometry; progress: number; strength?: number; band?: number; z: number}> = ({
	geometry,
	progress,
	strength = 0.08,
	band = 0.35,
	z,
}) => {
	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				transparent: true,
				depthWrite: false,
				blending: AdditiveBlending,
				uniforms: {
					uProgress: {value: -1},
					uStatic: {value: strength},
					uBand: {value: band},
					uColor: {value: new Color('#ffffff')},
				},
			}),
		[strength, band],
	);
	material.uniforms.uProgress.value = progress;
	return <mesh geometry={geometry} material={material} position={[0, 0, z]} renderOrder={5} />;
};
