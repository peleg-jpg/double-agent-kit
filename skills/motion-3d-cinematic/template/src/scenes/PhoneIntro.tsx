import {Audio, Video} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import React from 'react';
import {AbsoluteFill, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {progress, projectToScreen, sampleCamera} from '../lib/anim';
import {useFont3D} from '../lib/useFont3D';
import {remapTime, resolveSrc} from '../lib/media';
import {Backdrop, DomTitle, Pill, Vignette} from '../dom/Overlays';
import {getLook, type LookId} from '../looks';
import {Particles} from '../three/Particles';
import {ContactShadow, Phone, PHONE, PHONE_SCREEN_PX} from '../three/Phone';
import {ScreenFeed, useScreenTexture} from '../three/ScreenTexture';
import {CameraRig, Lights, StageSetup, sweepProgress, SweepLight} from '../three/Stage';
import {Title3D} from '../three/Title3D';

export type PhoneIntroProps = {
	look: LookId;
	titleLines: string[]; // 1-2 short lines, max ~14 characters each for 3D
	kicker?: string; // small pill above the title, '' to hide
	videoSrc?: string; // file in public/ ("screen.mp4") or https URL. Empty = placeholder screen
	videoStartSec?: number; // start the recording from this second
	volume?: number; // 0..1, audio of the recording. 0 = silent intro
	handoff?: boolean; // end by pushing into the screen and cutting to the full-frame video
	titleMode?: '3d' | 'dom';
	accent?: string; // brand color: title sides + pill. Empty = look default
	frameColor?: string; // phone frame color. Empty = look default
	durationSec?: number;
};

// Authored timeline (seconds) for an 11 s intro. See references/looks.md.
const AUTHORED = 11;
const HEAD = 2.2;
const TAIL = 2.4; // push-in 8.6 -> 10.15, then 0.85 s for the handoff
const PHONE_Y = -1.25;
const TITLE: [number, number, number] = [0, 2.72, 0.9];
const TITLE_SIZE = 0.56;
const VIDEO_ASPECT = 9 / 16; // the recording on the phone is a 9:16 reel

export const PhoneIntro: React.FC<PhoneIntroProps> = ({
	look: lookId,
	titleLines,
	kicker = '',
	videoSrc = '',
	videoStartSec = 0,
	volume = 1,
	handoff = true,
	titleMode = '3d',
	accent = '',
	frameColor = '',
	durationSec = AUTHORED,
}) => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();
	const look = getLook(lookId);
	const font = useFont3D();
	const src = resolveSrc(videoSrc);
	const dur = durationInFrames / fps;
	const t = frame / fps;
	const T = remapTime(t, dur, AUTHORED, HEAD, TAIL); // authored time
	const screen = useScreenTexture(PHONE_SCREEN_PX.W, PHONE_SCREEN_PX.H);
	const startFrames = Math.round(videoStartSec * fps);

	const keys = handoff ? look.camera.phone : look.camera.phone.filter((k) => k.t <= AUTHORED - TAIL);

	// phone entrance (spring) + slow monotonic drift, then square up for the push-in
	const s = spring({frame: frame - Math.round(look.timing.deviceIn * fps), fps, config: look.spring});
	const square = handoff ? progress(frame, fps, dur - TAIL, 1.2) : 0;
	const drift = Math.min(1, T / (AUTHORED - TAIL));
	const tilt = look.device.restTilt;
	const rotX = (tilt[0] + (1 - s) * 0.45) * (1 - square);
	const rotY = (tilt[1] - drift * 0.14 + (1 - s) * -0.95) * (1 - square);
	const rotZ = tilt[2] * (1 - square);
	const posY = PHONE_Y - (1 - s) * 6 + drift * 0.12 * (1 - square);

	const glare = sweepProgress(look, T);
	const fadeStart = dur - 0.85;
	const fullOpacity = handoff && src ? interpolate(t, [fadeStart, fadeStart + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
	const handoffFrom = Math.round(fadeStart * fps);
	// The push-in ends with the screen overfilling the frame. The full-frame video
	// starts at the same apparent scale and eases back to 1, so the cut is invisible.
	const endCam = keys[keys.length - 1];
	const screenW = PHONE.W - 2 * PHONE.bezel;
	const screenAspect = screenW / (PHONE.H - 2 * PHONE.bezel);
	const coverFrac = Math.min(1, screenAspect / VIDEO_ASPECT);
	const dist = endCam.pos[2] - (PHONE.D / 2 + PHONE.B);
	const visibleW = 2 * Math.tan(((endCam.fov ?? 30) * Math.PI) / 360) * dist * (width / height);
	const matchScale = screenW / coverFrac / visibleW;
	const fullScale = interpolate(t, [fadeStart + 0.25, fadeStart + 0.85], [matchScale, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
	});
	// kicker pill sticks to the top of the 3D title
	const kickerAt = projectToScreen(sampleCamera(keys, T), [TITLE[0], TITLE[1] + TITLE_SIZE * 0.85, TITLE[2]], width, height);
	const titleSide = accent || undefined;

	return (
		<AbsoluteFill>
			<Backdrop look={look} />
			<ThreeCanvas width={width} height={height} gl={{antialias: true}} camera={{fov: 30, position: [0, 0, 18]}}>
				<StageSetup look={look} />
				<CameraRig keys={keys} timeSec={T} />
				<Lights look={look} />
				<SweepLight look={look} timeSec={T} y={PHONE_Y + 1} />
				<Particles look={look} />
				<group position={[0, posY, 0]} rotation={[rotX, rotY, rotZ]} scale={0.92 + 0.08 * s}>
					<Phone look={look} texture={screen.texture} glare={glare} frameColor={frameColor || undefined} />
				</group>
				<ContactShadow opacity={look.shadow * s} y={PHONE_Y - PHONE.H / 2 - 0.55} width={4.2} depth={1.6} />
				{titleMode === '3d' && font ? (
					<Title3D
						font={font}
						look={look}
						lines={titleLines}
						position={TITLE}
						size={TITLE_SIZE}
						maxWidth={4.0}
						startSec={look.timing.titleIn}
						staggerSec={look.timing.titleStagger}
						durSec={look.timing.titleDur}
						sideColor={titleSide}
					/>
				) : null}
				<ScreenFeed
					src={src}
					W={PHONE_SCREEN_PX.W}
					H={PHONE_SCREEN_PX.H}
					fit="cover"
					placeholder="הסרטון שלכם כאן"
					ctx={screen.ctx}
					texture={screen.texture}
					trimBefore={startFrames || undefined}
				/>
			</ThreeCanvas>
			{titleMode === 'dom' ? (
				<DomTitle
					look={look}
					lines={titleLines}
					top={330}
					startSec={look.timing.titleIn}
					staggerSec={look.timing.titleStagger}
					durSec={look.timing.titleDur}
					accent={titleSide}
				/>
			) : null}
			{kicker ? <Pill look={look} text={kicker} x={kickerAt.x} y={titleMode === '3d' ? kickerAt.y - 14 : 310} inSec={look.timing.titleIn + 0.5} outSec={handoff ? dur - TAIL : undefined} accent={titleSide} /> : null}
			<Vignette look={look} />
			{src && volume > 0 ? (
				<Audio
					src={src}
					trimBefore={startFrames || undefined}
					volume={(f) => interpolate(f, [0, 8], [0, volume], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
				/>
			) : null}
			{handoff && src ? (
				<Sequence from={handoffFrom} layout="none">
					<AbsoluteFill style={{opacity: fullOpacity, transform: `scale(${fullScale})`}}>
						<Video src={src} muted trimBefore={handoffFrom + startFrames} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
					</AbsoluteFill>
				</Sequence>
			) : null}
		</AbsoluteFill>
	);
};
