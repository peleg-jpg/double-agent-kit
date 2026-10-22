import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {CanvasTexture, Color, ExtrudeGeometry, InstancedMesh, Object3D} from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {flatGeometry, roundedRect} from '../lib/shapes';
import type {Look} from '../looks';
import {Glare} from './Glare';

// Laptop with an opening lid, 16:10 screen, keyboard and trackpad.
// Origin: centre of the base bottom. lidOpen: 0 = closed, 1 = open (leans back 12.6 deg).
export const LAPTOP = {W: 7.0, D: 4.8, BT: 0.14, LH: 4.6, LT: 0.07, SW: 6.56, SH: 4.1};
export const LAPTOP_SCREEN_PX = {W: 1600, H: 1000};

export const Laptop: React.FC<{
	look: Look;
	texture: CanvasTexture;
	lidOpen: number;
	screenOn: number;
	glare: number;
	frameColor?: string;
}> = ({look, texture, lidOpen, screenOn, glare, frameColor}) => {
	const {W, D, BT, LH, LT, SW, SH} = LAPTOP;
	const bev = 0.03;
	const top = BT + 2 * bev;
	const geo = useMemo(() => {
		const base = new ExtrudeGeometry(roundedRect(W - 2 * bev, D - 2 * bev, 0.32), {
			depth: BT,
			bevelEnabled: true,
			bevelThickness: bev,
			bevelSize: bev,
			bevelSegments: 4,
			curveSegments: 20,
		});
		base.rotateX(-Math.PI / 2);
		base.translate(0, bev, 0);
		const lid = new ExtrudeGeometry(roundedRect(W - 0.05, LH - 0.05, 0.3), {
			depth: LT,
			bevelEnabled: true,
			bevelThickness: 0.02,
			bevelSize: 0.02,
			bevelSegments: 3,
			curveSegments: 20,
		});
		lid.translate(0, LH / 2, -(LT + 0.02));
		const bezel = flatGeometry(W - 0.14, LH - 0.14, 0.26, 20);
		const screen = flatGeometry(SW, SH, 0.05, 8);
		const notch = flatGeometry(0.72, 0.17, 0.06, 8);
		const well = flatGeometry(6.1, 2.45, 0.12, 8);
		const pad = flatGeometry(2.5, 1.5, 0.12, 8);
		const key = new RoundedBoxGeometry(0.38, 0.05, 0.36, 2, 0.04);
		return {base, lid, bezel, screen, notch, well, pad, key};
	}, [W, D, BT, LH, LT, SW, SH]);

	// keyboard: 13 x 5 instanced keys + a wide space bar row
	const keysRef = useRef<InstancedMesh>(null);
	const COLS = 13;
	const ROWS = 5;
	useLayoutEffect(() => {
		const m = keysRef.current;
		if (!m) return;
		const o = new Object3D();
		let i = 0;
		for (let r = 0; r < ROWS; r++) {
			for (let c = 0; c < COLS; c++) {
				o.position.set((c - (COLS - 1) / 2) * 0.445, top + 0.02, -1.95 + r * 0.43);
				o.scale.set(1, 1, 1);
				o.updateMatrix();
				m.setMatrixAt(i++, o.matrix);
			}
		}
		m.instanceMatrix.needsUpdate = true;
	}, [top]);

	const metal = frameColor ?? look.device.frame;
	const lidRot = Math.PI / 2 + (-0.22 - Math.PI / 2) * lidOpen;
	const hingeZ = -D / 2 + 0.16;
	return (
		<group>
			<mesh geometry={geo.base}>
				<meshPhysicalMaterial color={metal} metalness={look.device.metalness} roughness={look.device.roughness + 0.08} clearcoat={0.2} />
			</mesh>
			<mesh geometry={geo.well} rotation={[-Math.PI / 2, 0, 0]} position={[0, top + 0.002, -1.09]}>
				<meshStandardMaterial color="#0e0f11" roughness={0.6} metalness={0.2} />
			</mesh>
			<instancedMesh ref={keysRef} args={[geo.key, undefined, COLS * ROWS]}>
				<meshStandardMaterial color="#1b1c1f" roughness={0.55} metalness={0.1} />
			</instancedMesh>
			<mesh geometry={geo.pad} rotation={[-Math.PI / 2, 0, 0]} position={[0, top + 0.002, 1.35]}>
				<meshPhysicalMaterial color={new Color(metal).offsetHSL(0, 0, -0.04)} metalness={0.7} roughness={0.35} clearcoat={0.6} />
			</mesh>
			{/* lid, hinged at the back edge */}
			<group position={[0, top - 0.02, hingeZ]} rotation={[lidRot, 0, 0]}>
				<mesh geometry={geo.lid}>
					<meshPhysicalMaterial color={metal} metalness={look.device.metalness} roughness={look.device.roughness + 0.05} clearcoat={0.2} />
				</mesh>
				<mesh geometry={geo.bezel} position={[0, LH / 2, 0.003]}>
					<meshPhysicalMaterial color="#040404" roughness={0.1} clearcoat={1} />
				</mesh>
				<mesh geometry={geo.screen} position={[0, LH / 2 + 0.1, 0.006]}>
					<meshBasicMaterial map={texture} toneMapped={false} color={new Color(screenOn, screenOn, screenOn)} />
				</mesh>
				<mesh geometry={geo.notch} position={[0, LH / 2 + 0.1 + SH / 2 - 0.07, 0.008]}>
					<meshBasicMaterial color="#000000" />
				</mesh>
				<group position={[0, LH / 2 + 0.1, 0]}>
					<Glare geometry={geo.screen} progress={glare} z={0.01} strength={0.07} band={0.6} />
				</group>
			</group>
		</group>
	);
};
