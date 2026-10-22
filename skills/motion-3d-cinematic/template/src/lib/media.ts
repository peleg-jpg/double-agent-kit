import {staticFile} from 'remotion';

// "screen.mp4" -> file in public/, "https://..." -> used as is.
export const resolveSrc = (src?: string | null) => {
	if (!src) return null;
	return /^https?:\/\//.test(src) ? src : staticFile(src.replace(/^\/?public\//, '').replace(/^\//, ''));
};

// Stretch only the calm middle of an authored timeline. The first `head` seconds
// and the last `tail` seconds keep their authored speed, so entrances and the
// push-in feel the same at 8 s or at 20 s.
export const remapTime = (t: number, dur: number, authoredDur: number, head: number, tail: number) => {
	if (t <= head) return t;
	const realTailStart = dur - tail;
	const authoredTailStart = authoredDur - tail;
	if (t >= realTailStart) return authoredTailStart + (t - realTailStart);
	const k = (t - head) / Math.max(0.001, realTailStart - head);
	return head + k * (authoredTailStart - head);
};
