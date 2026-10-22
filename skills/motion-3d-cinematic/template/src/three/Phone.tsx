import React, {useMemo} from 'react';
import {CanvasTexture, ExtrudeGeometry} from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {flatGeometry, roundedRect} from '../lib/shapes';
import type {Look} from '../looks';
import {Glare} from './Glare';

// Modern phone with a titanium frame, black glass face, Dynamic Island, side
// buttons and a camera bump. World units: 2.6 wide, 5.4 tall (about iPhone ratio).
export const PHONE = {W: 2.6, H: 5.4, R: 0.42, D: 0.2, B: 0.06, bezel: 0.1};
// Screen canvas resolution. Matches the screen aspect so "cover" crops evenly.
export const PHONE_SCREEN_PX = {W: 1080, H: Math.round((1080 * (PHONE.H - 2 * PHONE.bezel)) / (PHONE.W - 2 * PHONE.bezel))};

export const Phone: React.FC<{look: Look; texture: CanvasTexture; glare: number; frameColor?: string}> = ({
	look,
	texture,
	glare,
	frameColor,
}) => {
	const {W, H, R, D, B, bezel} = PHONE;
	const front = D / 2 + B;
	const geo = useMemo(() => {
		const body = new ExtrudeGeometry(roundedRect(W - 2 * B, H - 2 * B, R - B), {
			depth: D,
			bevelEnabled: true,
			bevelThickness: B,
			bevelSize: B,
			bevelSegments: 6,
			curveSegments: 28,
		});
		body.translate(0, 0, -D / 2);
		const glass = flatGeometry(W - 0.05, H - 0.05, R - 0.03, 28);
		const screen = flatGeometry(W - 2 * bezel, H - 2 * bezel, R - bezel + 0.02, 28);
		const island = flatGeometry(0.78, 0.23, 0.115, 12);
		const bump = new ExtrudeGeometry(roundedRect(1.15, 1.15, 0.3), {
			depth: 0.05,
			bevelEnabled: true,
			bevelThickness: 0.02,
			bevelSize: 0.02,
			bevelSegments: 3,
			curveSegments: 16,
		});
		const btnLong = new RoundedBoxGeometry(0.05, 0.62, 0.12, 2, 0.022);
		const btnShort = new RoundedBoxGeometry(0.05, 0.3, 0.12, 2, 0.022);
		const btnPower = new RoundedBoxGeometry(0.05, 0.9, 0.12, 2, 0.022);
		return {body, glass, screen, island, bump, btnLong, btnShort, btnPower};
	}, [W, H, R, D, B, bezel]);

	const metal = frameColor ?? look.device.frame;
	const sx = W / 2 + 0.005;
	return (
		<group>
			<mesh geometry={geo.body}>
				<meshPhysicalMaterial color={metal} metalness={look.device.metalness} roughness={look.device.roughness} clearcoat={0.3} />
			</mesh>
			{/* black glass face */}
			<mesh geometry={geo.glass} position={[0, 0, front + 0.002]}>
				<meshPhysicalMaterial color="#030303" roughness={0.12} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />
			</mesh>
			{/* live screen */}
			<mesh geometry={geo.screen} position={[0, 0, front + 0.004]}>
				<meshBasicMaterial map={texture} toneMapped={false} />
			</mesh>
			<mesh geometry={geo.island} position={[0, H / 2 - bezel - 0.25, front + 0.006]}>
				<meshBasicMaterial color="#000000" />
			</mesh>
			<Glare geometry={geo.screen} progress={glare} z={front + 0.009} band={0.8} strength={0.1} />
			{/* buttons: action + volume on the left, power on the right */}
			<mesh geometry={geo.btnShort} position={[-sx, 1.45, 0]}>
				<meshStandardMaterial color={metal} metalness={1} roughness={0.35} />
			</mesh>
			<mesh geometry={geo.btnLong} position={[-sx, 0.75, 0]}>
				<meshStandardMaterial color={metal} metalness={1} roughness={0.35} />
			</mesh>
			<mesh geometry={geo.btnLong} position={[-sx, -0.0, 0]}>
				<meshStandardMaterial color={metal} metalness={1} roughness={0.35} />
			</mesh>
			<mesh geometry={geo.btnPower} position={[sx, 0.85, 0]}>
				<meshStandardMaterial color={metal} metalness={1} roughness={0.35} />
			</mesh>
			{/* camera bump on the back */}
			<group position={[-W / 2 + 0.78, H / 2 - 0.78, -front - 0.07]} rotation={[0, Math.PI, 0]}>
				<mesh geometry={geo.bump}>
					<meshPhysicalMaterial color={metal} metalness={0.6} roughness={0.25} clearcoat={1} />
				</mesh>
				{[
					[-0.26, 0.26],
					[0.26, 0],
					[-0.26, -0.26],
				].map(([x, y], i) => (
					<mesh key={i} position={[x, y, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
						<cylinderGeometry args={[0.2, 0.22, 0.08, 32]} />
						<meshPhysicalMaterial color="#0b0b0d" metalness={0.2} roughness={0.1} clearcoat={1} />
					</mesh>
				))}
			</group>
		</group>
	);
};

// Soft contact shadow (a radial gradient on a floor plane). Used by Clean White.
export const ContactShadow: React.FC<{opacity: number; y: number; width: number; depth: number}> = ({opacity, y, width, depth}) => {
	const tex = useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 256;
		c.height = 256;
		const ctx = c.getContext('2d')!;
		const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
		g.addColorStop(0, 'rgba(0,0,0,1)');
		g.addColorStop(0.5, 'rgba(0,0,0,0.45)');
		g.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, 256, 256);
		return new CanvasTexture(c);
	}, []);
	if (opacity <= 0) return null;
	return (
		<mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
			<planeGeometry args={[width, depth]} />
			<meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
		</mesh>
	);
};
