import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {progress} from '../lib/anim';
import {heebo, secular} from '../lib/fonts';
import type {Look} from '../looks';

// Background gradient behind the transparent WebGL canvas.
export const Backdrop: React.FC<{look: Look}> = ({look}) => (
	<AbsoluteFill style={{background: `radial-gradient(120% 75% at 50% 42%, ${look.bgInner} 0%, ${look.bgOuter} 100%)`}} />
);

export const Vignette: React.FC<{look: Look}> = ({look}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(110% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${look.vignette}) 100%)`,
		}}
	/>
);

// Small RTL pill (kicker above the title, or CTA). Latin words stay grouped
// because we never wrap single words in their own bidi isolate.
export const Pill: React.FC<{
	look: Look;
	text: string;
	x?: number; // anchor: bottom centre of the pill, in px. Default: centred
	y: number;
	inSec: number;
	outSec?: number;
	fontSize?: number;
	accent?: string;
}> = ({look, text, x, y, inSec, outSec, fontSize = 40, accent}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pin = progress(frame, fps, inSec, 0.6);
	const pout = outSec === undefined ? 0 : progress(frame, fps, outSec, 0.4);
	const o = pin * (1 - pout);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				dir="rtl"
				style={{
					position: 'absolute',
					left: x ?? 540,
					top: y,
					direction: 'rtl',
					fontFamily: heebo,
					fontWeight: 700,
					fontSize,
					lineHeight: 1.1,
					color: accent ?? look.dom.pillText,
					background: look.dom.pillBg,
					border: `2px solid ${accent ?? look.dom.pillText}`,
					borderRadius: 999,
					padding: `${fontSize * 0.32}px ${fontSize * 0.8}px`,
					whiteSpace: 'nowrap',
					opacity: o,
					transform: `translate(-50%, -100%) translateY(${(1 - pin) * 24}px)`,
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};

// DOM title fallback: full browser text shaping and bidi. Use it for niqqud,
// long lines, numbers mixed with punctuation, or anything the 3D bidi can't do.
// Same right-to-left wipe as the 3D title, done with clip-path.
export const DomTitle: React.FC<{
	look: Look;
	lines: string[];
	top: number;
	fontSize?: number;
	startSec: number;
	staggerSec: number;
	durSec: number;
	color?: string;
	accent?: string;
}> = ({look, lines, top, fontSize = 110, startSec, staggerSec, durSec, color, accent}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill style={{alignItems: 'center', pointerEvents: 'none'}}>
			<div dir="rtl" style={{position: 'absolute', top, width: 940, direction: 'rtl', textAlign: 'center'}}>
				{lines.map((line, i) => {
					const p = progress(frame, fps, startSec + i * staggerSec, durSec);
					return (
						<div
							key={i}
							style={{
								fontFamily: secular,
								fontSize,
								lineHeight: 1.12,
								color: color ?? look.dom.text,
								whiteSpace: 'nowrap',
								clipPath: `inset(0 0 0 ${(1 - p) * 100}%)`,
								transform: `translateY(${(1 - p) * 30}px)`,
								textShadow: `0 6px 0 ${accent ?? look.title.side}, 0 18px 40px rgba(0,0,0,0.35)`,
							}}
						>
							{line}
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
