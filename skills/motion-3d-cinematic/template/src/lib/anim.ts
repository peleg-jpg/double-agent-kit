import {Easing, interpolate} from 'remotion';
import {PerspectiveCamera, Vector3} from 'three';

export type Vec3 = [number, number, number];

// One camera keyframe. t is in seconds so a look works at any fps.
export type CamKey = {t: number; pos: Vec3; target: Vec3; fov?: number};

const ease = Easing.bezier(0.45, 0, 0.2, 1);

// Piecewise ease in-out between camera keys. Each segment eases on its own, so
// the camera settles on every key: use few keys (3-5) for calm, premium moves.
export const sampleCamera = (keys: CamKey[], timeSec: number) => {
	if (timeSec <= keys[0].t) return keys[0];
	const last = keys[keys.length - 1];
	if (timeSec >= last.t) return last;
	let i = 0;
	while (i < keys.length - 2 && timeSec > keys[i + 1].t) i++;
	const a = keys[i];
	const b = keys[i + 1];
	const p = ease((timeSec - a.t) / (b.t - a.t));
	const lerp = (x: number, y: number) => x + (y - x) * p;
	return {
		t: timeSec,
		pos: [lerp(a.pos[0], b.pos[0]), lerp(a.pos[1], b.pos[1]), lerp(a.pos[2], b.pos[2])] as Vec3,
		target: [
			lerp(a.target[0], b.target[0]),
			lerp(a.target[1], b.target[1]),
			lerp(a.target[2], b.target[2]),
		] as Vec3,
		fov: lerp(a.fov ?? 30, b.fov ?? 30),
	};
};

// 0..1 progress between two times in seconds, eased. Clamped.
export const progress = (
	frame: number,
	fps: number,
	startSec: number,
	durSec: number,
	easing: (n: number) => number = Easing.bezier(0.16, 1, 0.3, 1),
) =>
	interpolate(frame / fps, [startSec, startSec + durSec], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing,
	});

// Deterministic random so every render frame matches the preview.
export const seeded = (seed: number) => {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

// Project a world point to pixel coordinates for a sampled camera, so DOM layers
// (kicker pills, CTA, logo) can stick to a 3D object while the camera moves.
const _cam = new PerspectiveCamera();
const _v = new Vector3();
export const projectToScreen = (
	cam: {pos: Vec3; target: Vec3; fov?: number},
	point: Vec3,
	width: number,
	height: number,
) => {
	_cam.fov = cam.fov ?? 30;
	_cam.aspect = width / height;
	_cam.near = 0.1;
	_cam.far = 200;
	_cam.updateProjectionMatrix();
	_cam.position.set(cam.pos[0], cam.pos[1], cam.pos[2]);
	_cam.lookAt(cam.target[0], cam.target[1], cam.target[2]);
	_cam.updateMatrixWorld();
	_v.set(point[0], point[1], point[2]).project(_cam);
	return {x: ((_v.x + 1) / 2) * width, y: ((1 - _v.y) / 2) * height};
};
