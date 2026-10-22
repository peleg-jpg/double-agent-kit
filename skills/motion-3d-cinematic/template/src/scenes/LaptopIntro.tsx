import {Audio} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {progress, projectToScreen, sampleCamera} from '../lib/anim';
import {remapTime, resolveSrc} from '../lib/media';
import {useFont3D} from '../lib/useFont3D';
import {Backdrop, DomTitle, Pill, Vignette} from '../dom/Overlays';
import {getLook, type LookId} from '../looks';
import {Laptop, LAPTOP_SCREEN_PX} from '../three/Laptop';
import {Particles} from '../three/Particles';
import {ContactShadow} from '../three/Phone';
import {type Fit, ScreenFeed, useScreenTexture} from '../three/ScreenTexture';
import {CameraRig, Lights, StageSetup, sweepProgress, SweepLight} from '../three/Stage';
import {Title3D} from '../three/Title3D';

export type LaptopIntroProps = {
	look: LookId;
	titleLines: string[];
	kicker?: string;
	videoSrc?: string; // a desktop screen recording (16:9 or 16:10)
	videoStartSec?: number;
	volume?: number;
	fit?: Fit; // 'contain' keeps the whole recording (default), 'cover' fills the screen and crops
	titleMode?: '3d' | 'dom';
	accent?: string;
	frameColor?: string;
	durationSec?: number;
};

const AUTHORED = 10;
const BASE_Y = -3.7;
const TITLE: [number, number, number] = [0, 3.3, 1.2];
const TITLE_SIZE = 0.74;

export const LaptopIntro: React.FC<LaptopIntroProps> = ({
	look: lookId,
	titleLines,
	kicker = '',
	videoSrc = '',
	videoStartSec = 0,
	volume = 0,
	fit = 'contain',
	titleMode = '3d',
	accent = '',
	frameColor = '',
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();
	const look = getLook(lookId);
	const font = useFont3D();
	const src = resolveSrc(videoSrc);
	const dur = durationInFrames / fps;
	const t = frame / fps;
	const T = remapTime(t, dur, AUTHORED, 3, 0.01);
	const screen = useScreenTexture(LAPTOP_SCREEN_PX.W, LAPTOP_SCREEN_PX.H);
	const startFrames = Math.round(videoStartSec * fps);
	const keys = look.camera.laptop;

	const s = spring({frame: frame - Math.round(look.timing.deviceIn * fps), fps, config: look.spring});
	const lidOpen = progress(frame, fps, look.timing.deviceIn + 0.35, 1.5, (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2));
	const screenOn = progress(frame, fps, look.timing.deviceIn + 1.2, 0.5);
	const drift = Math.min(1, T / AUTHORED);
	const rotY = look.device.restTilt[1] * 1.6 - drift * 0.16 + (1 - s) * 0.6;
	const posY = BASE_Y - (1 - s) * 4;
	const glare = sweepProgress(look, T);
	const titleStart = look.timing.titleIn + 0.6;
	const kickerAt = projectToScreen(sampleCamera(keys, T), [TITLE[0], TITLE[1] + TITLE_SIZE * 0.85, TITLE[2]], width, height);
	const titleSide = accent || undefined;

	return (
		<AbsoluteFill>
			<Backdrop look={look} />
			<ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 30, position: [0, 0, 24]}}>
				<StageSetup look={look} />
				<CameraRig keys={keys} timeSec={T} />
				<Lights look={look} />
				<SweepLight look={look} timeSec={T} y={0} z={4} />
				<Particles look={look} zMax={-3} />
				<group position={[0, posY, 0]} rotation={[0, rotY, 0]} scale={0.86}>
					<Laptop look={look} texture={screen.texture} lidOpen={lidOpen} screenOn={screenOn} glare={glare} frameColor={frameColor || undefined} />
				</group>
				<ContactShadow opacity={look.shadow * s} y={BASE_Y - 0.02} width={10} depth={7} />
				{titleMode === '3d' && font ? (
					<Title3D
						font={font}
						look={look}
						lines={titleLines}
						position={TITLE}
						size={TITLE_SIZE}
						maxWidth={5.4}
						depth={0.28}
						startSec={titleStart}
						staggerSec={look.timing.titleStagger}
						durSec={look.timing.titleDur}
						sideColor={titleSide}
					/>
				) : null}
				<ScreenFeed
					src={src}
					W={LAPTOP_SCREEN_PX.W}
					H={LAPTOP_SCREEN_PX.H}
					fit={fit}
					placeholder="ההקלטה שלכם כאן"
					ctx={screen.ctx}
					texture={screen.texture}
					trimBefore={startFrames || undefined}
				/>
			</ThreeCanvas>
			{titleMode === 'dom' ? (
				<DomTitle look={look} lines={titleLines} top={330} startSec={titleStart} staggerSec={look.timing.titleStagger} durSec={look.timing.titleDur} accent={titleSide} />
			) : null}
			{kicker ? <Pill look={look} text={kicker} x={kickerAt.x} y={titleMode === '3d' ? kickerAt.y - 14 : 310} inSec={titleStart + 0.5} accent={titleSide} /> : null}
			<Vignette look={look} />
			{src && volume > 0 ? (
				<Audio
					src={src}
					trimBefore={startFrames || undefined}
					volume={(f) => interpolate(f, [0, 8], [0, volume], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
				/>
			) : null}
		</AbsoluteFill>
	);
};
