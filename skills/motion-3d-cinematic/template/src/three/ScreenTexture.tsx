import {useThree} from '@react-three/fiber';
import {Video} from '@remotion/media';
import React, {useCallback, useEffect, useState} from 'react';
import {continueRender, delayRender, useRemotionEnvironment} from 'remotion';
import {CanvasTexture, SRGBColorSpace} from 'three';
import {heebo} from '../lib/fonts';

export type Fit = 'cover' | 'contain';

const sourceSize = (f: CanvasImageSource) => {
	const anyF = f as unknown as Record<string, number>;
	const w = anyF.displayWidth || anyF.videoWidth || anyF.naturalWidth || anyF.width || 1;
	const h = anyF.displayHeight || anyF.videoHeight || anyF.naturalHeight || anyF.height || 1;
	return {w, h};
};

const drawFit = (ctx: CanvasRenderingContext2D, src: CanvasImageSource, W: number, H: number, fit: Fit) => {
	const {w, h} = sourceSize(src);
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, W, H);
	const s = fit === 'cover' ? Math.max(W / w, H / h) : Math.min(W / w, H / h);
	const dw = w * s;
	const dh = h * s;
	ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh);
};

// Placeholder when the student has not given a video yet. Canvas 2D handles RTL
// natively with ctx.direction = 'rtl'.
const drawPlaceholder = (ctx: CanvasRenderingContext2D, W: number, H: number, label: string) => {
	const g = ctx.createLinearGradient(0, 0, W, H);
	g.addColorStop(0, '#1d2633');
	g.addColorStop(1, '#0b0f15');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, W, H);
	ctx.direction = 'rtl';
	ctx.textAlign = 'center';
	ctx.fillStyle = '#e9edf2';
	ctx.font = `700 ${Math.round(W * 0.075)}px ${heebo}`;
	ctx.fillText(label, W / 2, H / 2);
	ctx.fillStyle = '#8a96a6';
	ctx.font = `400 ${Math.round(W * 0.045)}px ${heebo}`;
	ctx.fillText('שימו קובץ וידאו בתיקייה public', W / 2, H / 2 + W * 0.1);
};

// Canvas texture fed by a headless @remotion/media <Video>. This is the method
// Remotion recommends since 4.0.387 (useOffthreadVideoTexture is deprecated).
export const useScreenTexture = (W: number, H: number) => {
	const [stuff] = useState(() => {
		const canvas = document.createElement('canvas');
		canvas.width = W;
		canvas.height = H;
		const ctx = canvas.getContext('2d')!;
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		texture.anisotropy = 8;
		return {canvas, ctx, texture};
	});
	return stuff;
};

export const ScreenFeed: React.FC<{
	src?: string | null;
	W: number;
	H: number;
	fit: Fit;
	placeholder: string;
	ctx: CanvasRenderingContext2D;
	texture: CanvasTexture;
	trimBefore?: number;
}> = ({src, W, H, fit, placeholder, ctx, texture, trimBefore}) => {
	const {advance, invalidate} = useThree();
	const {isRendering} = useRemotionEnvironment();
	const onVideoFrame = useCallback(
		(frame: CanvasImageSource) => {
			drawFit(ctx, frame, W, H, fit);
			texture.needsUpdate = true;
			// During render the scene was already drawn before the async frame
			// arrived, so draw it again now (see Remotion docs, video as Three.js texture).
			if (isRendering) advance(performance.now());
			else invalidate();
		},
		[ctx, texture, W, H, fit, isRendering, advance, invalidate],
	);

	useEffect(() => {
		if (src) return;
		const h = delayRender('screen placeholder font');
		document.fonts
			.load(`700 40px ${heebo}`)
			.catch(() => undefined)
			.then(() => {
				drawPlaceholder(ctx, W, H, placeholder);
				texture.needsUpdate = true;
				if (isRendering) advance(performance.now());
				else invalidate();
				continueRender(h);
			});
	}, [src, ctx, W, H, placeholder, texture, isRendering, advance, invalidate]);

	if (!src) return null;
	return <Video src={src} headless muted onVideoFrame={onVideoFrame} trimBefore={trimBefore} />;
};
