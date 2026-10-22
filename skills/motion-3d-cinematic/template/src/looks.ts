import type {CamKey, Vec3} from './lib/anim';

// The 4 named looks. Every number here is tuned on real renders at 1080x1920.
// Camera keys are authored for an 11 s phone intro, 10 s laptop intro and 5 s end card,
// and are time-stretched when the composition is longer or shorter.

export type LookId = 'studio-dark' | 'clean-white' | 'neon-night' | 'golden-hour';

export type Look = {
	id: LookId;
	name: string;
	// DOM background behind the transparent WebGL canvas
	bgInner: string;
	bgOuter: string;
	vignette: number; // 0..1 darkness of the edge vignette
	fog: {color: string; near: number; far: number};
	particles: {
		color: string;
		accent: string;
		count: number;
		bokeh: number;
		speed: number; // world units per second, upward drift
		size: number;
		opacity: number;
		blending: 'additive' | 'normal';
	};
	lights: {
		ambient: number;
		key: {color: string; intensity: number; pos: Vec3};
		rim: {color: string; intensity: number; pos: Vec3};
		fill: {color: string; intensity: number; pos: Vec3};
		sweep: {color: string; intensity: number};
	};
	envIntensity: number;
	device: {frame: string; metalness: number; roughness: number; restTilt: Vec3};
	title: {face: string; side: string; metalness: number; roughness: number; emissive: number};
	dom: {text: string; muted: string; pillBg: string; pillText: string};
	shadow: number; // contact shadow opacity under the device (0 = none)
	spring: {damping: number; stiffness: number; mass: number};
	timing: {
		deviceIn: number; // s
		titleIn: number; // s, first line
		titleStagger: number; // s between lines
		titleDur: number; // s, wipe length per line
		sweeps: number[]; // s, light sweep starts across the glass
		sweepDur: number;
	};
	camera: {phone: CamKey[]; laptop: CamKey[]; endcard: CamKey[]};
};

// Push-in that ends with the phone screen filling the 9:16 frame (handoff to full-frame video).
const PHONE_PUSH: CamKey = {t: 10.15, pos: [0, -1.25, 7.7], target: [0, -1.25, 0], fov: 30};

export const LOOKS: Record<LookId, Look> = {
	'studio-dark': {
		id: 'studio-dark',
		name: 'Studio Dark',
		bgInner: '#20242b',
		bgOuter: '#050607',
		vignette: 0.55,
		fog: {color: '#07080a', near: 18, far: 46},
		particles: {
			color: '#aebdcc',
			accent: '#ffb547',
			count: 1400,
			bokeh: 26,
			speed: 0.22,
			size: 1,
			opacity: 0.85,
			blending: 'additive',
		},
		lights: {
			ambient: 0.18,
			key: {color: '#fff4e6', intensity: 2.4, pos: [-6, 7, 9]},
			rim: {color: '#ffb547', intensity: 3.2, pos: [7, 3, -6]},
			fill: {color: '#8fb3ff', intensity: 0.5, pos: [6, -4, 6]},
			sweep: {color: '#ffffff', intensity: 40},
		},
		envIntensity: 0.55,
		device: {frame: '#5a5e64', metalness: 1, roughness: 0.22, restTilt: [0, 0.2, 0]},
		title: {face: '#f4f1ea', side: '#ffb547', metalness: 0.35, roughness: 0.35, emissive: 0.05},
		dom: {text: '#f4f1ea', muted: '#aab3bd', pillBg: 'rgba(255,181,71,0.14)', pillText: '#ffcf85'},
		shadow: 0,
		spring: {damping: 20, stiffness: 90, mass: 1},
		timing: {deviceIn: 0.15, titleIn: 0.75, titleStagger: 0.35, titleDur: 1.1, sweeps: [2.4, 7.0], sweepDur: 1.3},
		camera: {
			// "Slow Orbit": enters from the right, glides across the front, pushes into the screen
			phone: [
				{t: 0, pos: [4.6, 1.4, 19.5], target: [0, 0.3, 0], fov: 30},
				{t: 2.2, pos: [1.7, 0.9, 17.6], target: [0, 0.3, 0], fov: 30},
				{t: 8.6, pos: [-1.7, 0.6, 17.0], target: [0, 0.3, 0], fov: 30},
				PHONE_PUSH,
			],
			laptop: [
				{t: 0, pos: [7, 6, 26.5], target: [0, 0.4, 0], fov: 30},
				{t: 3, pos: [3.2, 3.6, 24.5], target: [0, 0.4, 0], fov: 30},
				{t: 10, pos: [-1.8, 2.8, 24], target: [0, 0.4, 0], fov: 30},
			],
			endcard: [
				{t: 0, pos: [1.2, 0, 17.4], target: [0, 0.2, 0], fov: 30},
				{t: 5, pos: [-0.8, -0.2, 15.8], target: [0, 0.2, 0], fov: 30},
			],
		},
	},
	'clean-white': {
		id: 'clean-white',
		name: 'Clean White',
		bgInner: '#ffffff',
		bgOuter: '#e6e8ec',
		vignette: 0.12,
		fog: {color: '#eef0f3', near: 22, far: 60},
		particles: {
			color: '#9aa3ae',
			accent: '#2563eb',
			count: 700,
			bokeh: 14,
			speed: 0.15,
			size: 0.9,
			opacity: 0.55,
			blending: 'normal',
		},
		lights: {
			ambient: 0.55,
			key: {color: '#ffffff', intensity: 2.0, pos: [-5, 8, 10]},
			rim: {color: '#dbe6ff', intensity: 1.4, pos: [6, 4, -6]},
			fill: {color: '#ffffff', intensity: 0.8, pos: [5, -2, 8]},
			sweep: {color: '#ffffff', intensity: 18},
		},
		envIntensity: 0.9,
		device: {frame: '#d6d3cc', metalness: 1, roughness: 0.22, restTilt: [-0.1, 0.1, 0]},
		title: {face: '#111418', side: '#2563eb', metalness: 0.1, roughness: 0.45, emissive: 0},
		dom: {text: '#111418', muted: '#5b6470', pillBg: 'rgba(37,99,235,0.10)', pillText: '#1d4ed8'},
		shadow: 0.32,
		spring: {damping: 26, stiffness: 80, mass: 1},
		timing: {deviceIn: 0.2, titleIn: 0.8, titleStagger: 0.3, titleDur: 1.0, sweeps: [2.8], sweepDur: 1.4},
		camera: {
			// "Tabletop Float": slightly above, looking down, slow lateral truck
			phone: [
				{t: 0, pos: [0, 4.2, 19], target: [0, 0.2, 0], fov: 30},
				{t: 3, pos: [1.0, 3.0, 17.4], target: [0, 0.2, 0], fov: 30},
				{t: 8.6, pos: [-1.0, 2.4, 16.9], target: [0, 0.2, 0], fov: 30},
				PHONE_PUSH,
			],
			laptop: [
				{t: 0, pos: [0, 9, 26.5], target: [0, 0.2, 0], fov: 30},
				{t: 3, pos: [1.6, 5.5, 24.5], target: [0, 0.4, 0], fov: 30},
				{t: 10, pos: [-1.6, 4.6, 23.5], target: [0, 0.4, 0], fov: 30},
			],
			endcard: [
				{t: 0, pos: [0, 0.6, 17.4], target: [0, 0.2, 0], fov: 30},
				{t: 5, pos: [0, 0.2, 16], target: [0, 0.2, 0], fov: 30},
			],
		},
	},
	'neon-night': {
		id: 'neon-night',
		name: 'Neon Night',
		bgInner: '#0b1626',
		bgOuter: '#020409',
		vignette: 0.6,
		fog: {color: '#03060c', near: 16, far: 42},
		particles: {
			color: '#22e4ff',
			accent: '#ff4d6d',
			count: 2200,
			bokeh: 40,
			speed: 0.35,
			size: 1.35,
			opacity: 0.9,
			blending: 'additive',
		},
		lights: {
			ambient: 0.12,
			key: {color: '#e8fbff', intensity: 1.6, pos: [-5, 6, 9]},
			rim: {color: '#22e4ff', intensity: 5, pos: [-7, 2, -5]},
			fill: {color: '#ff4d6d', intensity: 3.2, pos: [7, -2, -3]},
			sweep: {color: '#9ff3ff', intensity: 45},
		},
		envIntensity: 0.4,
		device: {frame: '#1c2026', metalness: 1, roughness: 0.25, restTilt: [0, -0.1, 0]},
		title: {face: '#effdff', side: '#22e4ff', metalness: 0.2, roughness: 0.3, emissive: 0.25},
		dom: {text: '#effdff', muted: '#8fd8e6', pillBg: 'rgba(255,77,109,0.16)', pillText: '#ff8fa3'},
		shadow: 0,
		spring: {damping: 14, stiffness: 110, mass: 0.9},
		timing: {deviceIn: 0.1, titleIn: 0.6, titleStagger: 0.28, titleDur: 0.9, sweeps: [2.0, 5.2, 8.0], sweepDur: 1.0},
		camera: {
			// "Low Arc": starts low on the left, rises in an arc to the front
			phone: [
				{t: 0, pos: [-7.5, -2.8, 14.5], target: [0, -0.2, 0], fov: 30},
				{t: 2.6, pos: [-1.6, 0.4, 17.4], target: [0, 0.3, 0], fov: 30},
				{t: 8.6, pos: [1.9, 0.9, 16.9], target: [0, 0.3, 0], fov: 30},
				PHONE_PUSH,
			],
			laptop: [
				{t: 0, pos: [-9, -1, 22.5], target: [0, 0.4, 0], fov: 30},
				{t: 3, pos: [-2.6, 3, 24.5], target: [0, 0.4, 0], fov: 30},
				{t: 10, pos: [1.6, 3.4, 24], target: [0, 0.4, 0], fov: 30},
			],
			endcard: [
				{t: 0, pos: [-1.6, -1, 17.9], target: [0, 0.2, 0], fov: 30},
				{t: 5, pos: [1, 0, 15.6], target: [0, 0.2, 0], fov: 30},
			],
		},
	},
	'golden-hour': {
		id: 'golden-hour',
		name: 'Golden Hour',
		bgInner: '#3a2414',
		bgOuter: '#0d0805',
		vignette: 0.5,
		fog: {color: '#0d0805', near: 18, far: 48},
		particles: {
			color: '#ffd59a',
			accent: '#ff8a3d',
			count: 1000,
			bokeh: 30,
			speed: 0.12,
			size: 1.05,
			opacity: 0.8,
			blending: 'additive',
		},
		lights: {
			ambient: 0.2,
			key: {color: '#ffd9a8', intensity: 2.8, pos: [-7, 8, 6]},
			rim: {color: '#ff8a3d', intensity: 3.5, pos: [6, 2, -6]},
			fill: {color: '#6f8cff', intensity: 0.35, pos: [6, -3, 6]},
			sweep: {color: '#ffe2b8', intensity: 34},
		},
		envIntensity: 0.6,
		device: {frame: '#b89870', metalness: 1, roughness: 0.32, restTilt: [0, 0.08, 0]},
		title: {face: '#fff4e2', side: '#d9822b', metalness: 0.4, roughness: 0.35, emissive: 0.04},
		dom: {text: '#fff4e2', muted: '#d8b993', pillBg: 'rgba(255,138,61,0.16)', pillText: '#ffc08a'},
		shadow: 0,
		spring: {damping: 30, stiffness: 70, mass: 1.1},
		timing: {deviceIn: 0.25, titleIn: 1.0, titleStagger: 0.4, titleDur: 1.3, sweeps: [3.0, 7.6], sweepDur: 1.6},
		camera: {
			// "Dolly Drift": straight-on dolly in with a lens breathe (fov 26 to 30)
			phone: [
				{t: 0, pos: [0, 0.7, 22.5], target: [0, 0.3, 0], fov: 26},
				{t: 8.6, pos: [0.7, 0.5, 16.8], target: [0, 0.3, 0], fov: 30},
				PHONE_PUSH,
			],
			laptop: [
				{t: 0, pos: [0, 3.2, 31.5], target: [0, 0.4, 0], fov: 26},
				{t: 10, pos: [1.2, 3, 23.5], target: [0, 0.4, 0], fov: 30},
			],
			endcard: [
				{t: 0, pos: [0, 0, 18.4], target: [0, 0.2, 0], fov: 27},
				{t: 5, pos: [0, 0, 16], target: [0, 0.2, 0], fov: 30},
			],
		},
	},
};

export const getLook = (id: LookId | string): Look => LOOKS[(id as LookId) in LOOKS ? (id as LookId) : 'studio-dark'];
