import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Color, Fog, PerspectiveCamera, PMREMGenerator} from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {sampleCamera, type CamKey} from '../lib/anim';
import type {Look} from '../looks';

// Environment map (reflections on metal and glass) + fog + clipping switch.
// RoomEnvironment is generated in code, so no HDR file has to be downloaded.
export const StageSetup: React.FC<{look: Look}> = ({look}) => {
	const {gl, scene} = useThree();
	useLayoutEffect(() => {
		gl.localClippingEnabled = true;
		const pmrem = new PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
		scene.environment = env;
		scene.environmentIntensity = look.envIntensity;
		scene.fog = new Fog(new Color(look.fog.color), look.fog.near, look.fog.far);
		return () => {
			env.dispose();
			pmrem.dispose();
			scene.environment = null;
			scene.fog = null;
		};
	}, [gl, scene, look]);
	return null;
};

// Camera driven only by useCurrentFrame(). Pass timeSec to remap time (the scenes
// stretch the calm middle of the move when the composition is longer).
export const CameraRig: React.FC<{keys: CamKey[]; timeSec?: number}> = ({keys, timeSec}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const camera = useThree((s) => s.camera) as PerspectiveCamera;
	const c = sampleCamera(keys, timeSec ?? frame / fps);
	useLayoutEffect(() => {
		camera.position.set(c.pos[0], c.pos[1], c.pos[2]);
		camera.fov = c.fov ?? 30;
		camera.near = 0.1;
		camera.far = 200;
		camera.updateProjectionMatrix();
		camera.lookAt(c.target[0], c.target[1], c.target[2]);
	});
	return null;
};

export const Lights: React.FC<{look: Look}> = ({look}) => {
	const {key, rim, fill} = look.lights;
	return (
		<>
			<ambientLight intensity={look.lights.ambient} />
			<directionalLight color={key.color} intensity={key.intensity} position={key.pos} />
			<directionalLight color={rim.color} intensity={rim.intensity} position={rim.pos} />
			<directionalLight color={fill.color} intensity={fill.intensity} position={fill.pos} />
		</>
	);
};

// A point light that travels across the front of the scene during each sweep.
// It drags a specular highlight over the metal frame and the title sides.
export const SweepLight: React.FC<{look: Look; timeSec?: number; z?: number; y?: number}> = ({look, timeSec, z = 3.2, y = 0.5}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = timeSec ?? frame / fps;
	let x = -20;
	let intensity = 0;
	for (const s of look.timing.sweeps) {
		const p = (t - s) / look.timing.sweepDur;
		if (p >= 0 && p <= 1) {
			x = -5 + 10 * p;
			intensity = look.lights.sweep.intensity * Math.sin(Math.PI * p);
		}
	}
	return <pointLight color={look.lights.sweep.color} intensity={intensity} distance={14} decay={1.6} position={[x, y, z]} />;
};

// Sweep progress 0..1 (or -1 when no sweep is running), used by the glass glare shader.
export const sweepProgress = (look: Look, t: number) => {
	for (const s of look.timing.sweeps) {
		const p = (t - s) / look.timing.sweepDur;
		if (p >= 0 && p <= 1) return p;
	}
	return -1;
};
