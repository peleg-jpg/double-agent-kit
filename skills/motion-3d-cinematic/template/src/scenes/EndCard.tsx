import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {progress, projectToScreen, sampleCamera} from '../lib/anim';
import {heebo} from '../lib/fonts';
import {resolveSrc} from '../lib/media';
import {useFont3D} from '../lib/useFont3D';
import {Backdrop, DomTitle, Pill, Vignette} from '../dom/Overlays';
import {getLook, type LookId} from '../looks';
import {Particles} from '../three/Particles';
import {CameraRig, Lights, StageSetup, SweepLight} from '../three/Stage';
import {Title3D} from '../three/Title3D';

export type EndCardProps = {
	look: LookId;
	titleLines: string[]; // the CTA headline, 1-2 lines
	cta: string; // the action, shown as a pill under the title
	handle?: string; // e.g. "@yourname", '' to hide
	logo?: string; // image in public/, '' to hide
	titleMode?: '3d' | 'dom';
	accent?: string;
	durationSec?: number;
};

const TITLE: [number, number, number] = [0, 0.55, 0.6];
const TITLE_SIZE = 0.8;

// Two thin rings orbiting behind the headline: a slow, frame-driven 3D focal point.
const Halo: React.FC<{color: string; t: number; reveal: number}> = ({color, t, reveal}) => (
	<group position={[0, 0.1, -1.2]} scale={0.6 + 0.4 * reveal}>
		<mesh rotation={[1.15 + t * 0.05, 0.25, t * 0.12]}>
			<torusGeometry args={[3.1, 0.022, 12, 220]} />
			<meshBasicMaterial color={color} transparent opacity={0.75 * reveal} toneMapped={false} />
		</mesh>
		<mesh rotation={[1.3 - t * 0.04, -0.35, -t * 0.09]}>
			<torusGeometry args={[3.6, 0.012, 12, 220]} />
			<meshBasicMaterial color={color} transparent opacity={0.4 * reveal} toneMapped={false} />
		</mesh>
	</group>
);

export const EndCard: React.FC<EndCardProps> = ({look: lookId, titleLines, cta, handle = '', logo = '', titleMode = '3d', accent = ''}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const look = getLook(lookId);
	const font = useFont3D();
	const t = frame / fps;
	const keys = look.camera.endcard;
	const cam = sampleCamera(keys, t);
	const lastLineY = TITLE[1] - (titleLines.length - 1) * TITLE_SIZE * 1.35;
	const under = projectToScreen(cam, [TITLE[0], lastLineY - TITLE_SIZE * 0.9, TITLE[2]], width, height);
	const kickerTop = Math.max(under.y + 110, 0);
	const logoSrc = resolveSrc(logo);
	const reveal = progress(frame, fps, 0, 1.2);
	const ctaIn = 0.2 + titleLines.length * 0.35 + 0.5;
	const handleIn = progress(frame, fps, ctaIn + 0.4, 0.6);
	const ringColor = accent || look.title.side;

	return (
		<AbsoluteFill>
			<Backdrop look={look} />
			<ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 30, position: [0, 0, 15]}}>
				<StageSetup look={look} />
				<CameraRig keys={keys} />
				<Lights look={look} />
				<SweepLight look={{...look, timing: {...look.timing, sweeps: [1.6], sweepDur: 1.4}}} y={TITLE[1]} z={3} />
				<Particles look={look} density={1.3} zMax={-1.5} />
				<Halo color={ringColor} t={t} reveal={reveal} />
				{titleMode === '3d' && font ? (
					<Title3D
						font={font}
						look={look}
						lines={titleLines}
						position={TITLE}
						size={TITLE_SIZE}
						maxWidth={3.9}
						startSec={0.2}
						staggerSec={0.35}
						durSec={look.timing.titleDur}
						sideColor={accent || undefined}
					/>
				) : null}
			</ThreeCanvas>
			{titleMode === 'dom' ? (
				<DomTitle look={look} lines={titleLines} top={640} startSec={0.2} staggerSec={0.35} durSec={look.timing.titleDur} accent={accent || undefined} />
			) : null}
			<Pill look={look} text={cta} x={width / 2} y={titleMode === '3d' ? kickerTop : 1030} inSec={ctaIn} fontSize={46} accent={accent || undefined} />
			{handle || logoSrc ? (
				<AbsoluteFill style={{alignItems: 'center', pointerEvents: 'none'}}>
					<div
						style={{
							position: 'absolute',
							top: kickerTop + 56,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							gap: 18,
							opacity: handleIn,
							transform: `translateY(${(1 - handleIn) * 20}px)`,
						}}
					>
						{logoSrc ? <Img src={logoSrc} style={{height: 96, objectFit: 'contain'}} /> : null}
						{handle ? (
							<div dir="ltr" style={{fontFamily: heebo, fontWeight: 700, fontSize: 40, color: look.dom.muted, letterSpacing: 1}}>
								{handle}
							</div>
						) : null}
					</div>
				</AbsoluteFill>
			) : null}
			<Vignette look={look} />
		</AbsoluteFill>
	);
};
