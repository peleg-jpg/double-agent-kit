import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {AdditiveBlending, BufferAttribute, BufferGeometry, Color, NormalBlending, ShaderMaterial} from 'three';
import {seeded} from '../lib/anim';
import type {Look} from '../looks';

// Depth particles: a dust layer (many, small, sharp) and a bokeh layer (few, big,
// soft). Movement is computed in the shader from uTime = frame / fps, so every
// rendered frame is deterministic. Never use useFrame() for this.

const vertex = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aSpeed;
attribute float aMix;
uniform float uTime;
uniform float uScale;
varying float vAlpha;
varying float vMix;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * aSpeed + 20.0, 40.0) - 20.0;
  p.x += sin(uTime * 0.25 + aPhase * 6.2831) * 0.18;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uScale / -mv.z;
  float depth = -mv.z;
  float twinkle = 0.65 + 0.35 * sin(uTime * 1.1 + aPhase * 12.0);
  vAlpha = twinkle * smoothstep(48.0, 14.0, depth) * smoothstep(1.5, 4.0, depth);
  vMix = aMix;
}`;

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;
uniform float uSoft;
varying float vAlpha;
varying float vMix;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.5 * uSoft, d);
  if (a < 0.01) discard;
  vec3 col = mix(uColor, uAccent, vMix);
  gl_FragColor = vec4(col, a * vAlpha * uOpacity);
}`;

type LayerProps = {
	look: Look;
	count: number;
	seed: number;
	sizeRange: [number, number];
	soft: number;
	opacity: number;
	speedMul: number;
	zMax: number;
};

const Layer: React.FC<LayerProps> = ({look, count, seed, sizeRange, soft, opacity, speedMul, zMax}) => {
	const frame = useCurrentFrame();
	const {fps, height} = useVideoConfig();
	const geometry = useMemo(() => {
		const r = seeded(seed);
		const pos = new Float32Array(count * 3);
		const size = new Float32Array(count);
		const phase = new Float32Array(count);
		const speed = new Float32Array(count);
		const mix = new Float32Array(count);
		for (let i = 0; i < count; i++) {
			pos[i * 3] = (r() - 0.5) * 24;
			pos[i * 3 + 1] = (r() - 0.5) * 40;
			// all particles stay behind the hero (z < zMax), so no dust crosses the screen or the face
			pos[i * 3 + 2] = -30 + r() * (30 + zMax);
			size[i] = sizeRange[0] + r() * (sizeRange[1] - sizeRange[0]);
			phase[i] = r();
			speed[i] = look.particles.speed * speedMul * (0.5 + r());
			mix[i] = r() < 0.14 ? 1 : 0;
		}
		const g = new BufferGeometry();
		g.setAttribute('position', new BufferAttribute(pos, 3));
		g.setAttribute('aSize', new BufferAttribute(size, 1));
		g.setAttribute('aPhase', new BufferAttribute(phase, 1));
		g.setAttribute('aSpeed', new BufferAttribute(speed, 1));
		g.setAttribute('aMix', new BufferAttribute(mix, 1));
		return g;
	}, [count, seed, sizeRange, look, speedMul, zMax]);

	const material = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: vertex,
				fragmentShader: fragment,
				transparent: true,
				depthWrite: false,
				blending: look.particles.blending === 'additive' ? AdditiveBlending : NormalBlending,
				uniforms: {
					uTime: {value: 0},
					uScale: {value: 1},
					uColor: {value: new Color(look.particles.color)},
					uAccent: {value: new Color(look.particles.accent)},
					uOpacity: {value: opacity},
					uSoft: {value: soft},
				},
			}),
		[look, opacity, soft],
	);
	material.uniforms.uTime.value = frame / fps;
	// pixels per world unit at distance 1 for a 30 degree vertical fov
	material.uniforms.uScale.value = (height * 0.5) / Math.tan((15 * Math.PI) / 180);
	return <points geometry={geometry} material={material} frustumCulled={false} />;
};

// zMax: nearest particle depth. Keep it behind the hero object (phone front is z 0.16).
export const Particles: React.FC<{look: Look; density?: number; zMax?: number}> = ({look, density = 1, zMax = -1}) => {
	const p = look.particles;
	return (
		<>
			<Layer
				look={look}
				count={Math.round(p.count * density)}
				seed={7}
				sizeRange={[0.024 * p.size, 0.065 * p.size]}
				soft={0.1}
				opacity={p.opacity}
				speedMul={1}
				zMax={zMax}
			/>
			<Layer
				look={look}
				count={Math.round(p.bokeh * density)}
				seed={42}
				sizeRange={[0.25 * p.size, 0.6 * p.size]}
				soft={0.72}
				opacity={p.opacity * 0.32}
				speedMul={0.5}
				zMax={zMax - 1}
			/>
		</>
	);
};
