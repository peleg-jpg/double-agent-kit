import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {Color, MeshPhysicalMaterial, Plane, Vector3} from 'three';
import type {Font} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {progress} from '../lib/anim';
import {toVisualOrder} from '../lib/bidi';
import type {Look} from '../looks';

// Extruded Hebrew title. Each line:
//  - is converted to visual order (lib/bidi.ts) because TextGeometry is LTR only
//  - auto-shrinks to maxWidth
//  - reveals right to left (Hebrew reading direction) with a world-space clipping
//    plane, while its depth grows from flat to full and it tilts up into place
//  - gets a thin light edge riding the wipe front
// The group must not be rotated around Y or Z: the clip plane works in world X.

export type Title3DProps = {
	font: Font;
	look: Look;
	lines: string[];
	position: [number, number, number]; // centre of the first line
	size?: number; // cap height in world units
	lineGap?: number;
	maxWidth?: number;
	depth?: number;
	startSec: number;
	staggerSec: number;
	durSec: number;
	faceColor?: string;
	sideColor?: string;
};

const Line: React.FC<{
	font: Font;
	look: Look;
	text: string;
	y: number;
	baseX: number;
	z: number;
	size: number;
	depth: number;
	maxWidth: number;
	start: number;
	dur: number;
	faceColor: string;
	sideColor: string;
}> = ({font, look, text, y, baseX, z, size, depth, maxWidth, start, dur, faceColor, sideColor}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const {geometry, width, height} = useMemo(() => {
		const g = new TextGeometry(toVisualOrder(text), {
			font,
			size,
			depth,
			curveSegments: 10,
			bevelEnabled: true,
			bevelThickness: depth * 0.22,
			bevelSize: size * 0.022,
			bevelSegments: 4,
		});
		g.computeBoundingBox();
		const bb = g.boundingBox!;
		const w = bb.max.x - bb.min.x;
		const h = bb.max.y - bb.min.y;
		g.translate(-(bb.min.x + w / 2), -(bb.min.y + h / 2), -depth / 2);
		return {geometry: g, width: w, height: h};
	}, [font, text, size, depth]);

	const scale = Math.min(1, maxWidth / width);
	const half = (width * scale) / 2;

	const clip = useMemo(() => new Plane(new Vector3(1, 0, 0), 0), []);
	const materials = useMemo(() => {
		const face = new MeshPhysicalMaterial({
			color: new Color(faceColor),
			metalness: look.title.metalness * 0.5,
			roughness: look.title.roughness,
			clearcoat: 0.6,
			emissive: new Color(faceColor),
			emissiveIntensity: look.title.emissive,
			clippingPlanes: [clip],
		});
		const side = new MeshPhysicalMaterial({
			color: new Color(sideColor),
			metalness: look.title.metalness,
			roughness: look.title.roughness,
			emissive: new Color(sideColor),
			emissiveIntensity: look.title.emissive * 1.5,
			clippingPlanes: [clip],
		});
		return [face, side];
	}, [faceColor, sideColor, look, clip]);

	const p = progress(frame, fps, start, dur);
	const grow = progress(frame, fps, start + dur * 0.15, dur * 0.85);
	// wipe front travels from the right edge to the left edge (+ margin for the bevel)
	const margin = size * 0.3;
	const front = baseX + half + margin - p * (2 * half + 2 * margin);
	clip.constant = -front;

	const edgeAlpha = p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0;
	return (
		<group position={[baseX, y - (1 - grow) * size * 0.45, z]} rotation={[(1 - grow) * 0.55, 0, 0]}>
			<mesh geometry={geometry} material={materials} scale={[scale, scale, Math.max(0.04, grow) * scale]} />
			{edgeAlpha > 0 ? (
				<mesh position={[front - baseX, 0, depth * scale * 0.6]}>
					<planeGeometry args={[size * 0.05, height * scale * 1.5]} />
					<meshBasicMaterial color={sideColor} transparent opacity={edgeAlpha} toneMapped={false} depthWrite={false} />
				</mesh>
			) : null}
		</group>
	);
};

export const Title3D: React.FC<Title3DProps> = ({
	font,
	look,
	lines,
	position,
	size = 0.62,
	lineGap = 1.35,
	maxWidth = 4.6,
	depth = 0.22,
	startSec,
	staggerSec,
	durSec,
	faceColor,
	sideColor,
}) => (
	<>
		{lines.map((text, i) => (
			<Line
				key={i}
				font={font}
				look={look}
				text={text}
				y={position[1] - i * size * lineGap}
				baseX={position[0]}
				z={position[2]}
				size={size}
				depth={depth}
				maxWidth={maxWidth}
				start={startSec + i * staggerSec}
				dur={durSec}
				faceColor={faceColor ?? look.title.face}
				sideColor={sideColor ?? look.title.side}
			/>
		))}
	</>
);
