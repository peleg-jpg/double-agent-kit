// Minimal single-line bidi for 3D text.
// three.js TextGeometry lays glyphs out left to right in string order and knows
// nothing about RTL. Hebrew has no contextual shaping, so we only need to turn the
// logical string into visual order:
//   1. split into runs: Hebrew (RTL), Latin letters and digits (LTR), neutrals
//   2. a neutral run sitting between two LTR runs joins them ("Claude Code" stays
//      one group), every other neutral follows the RTL base direction
//   3. reverse the run order, reverse the characters inside RTL runs, keep LTR
//      runs as they are, mirror brackets inside RTL runs
// Good for titles like "ה-AI שעובד" or "Claude Code בעברית!". Not a full UBA:
// no niqqud, no nested quotes, no multi-line paragraphs. Use the DOM title for those.

const isRtl = (c: string) => /[֐-׿יִ-ﭏ]/.test(c);
const isLtr = (c: string) => /[A-Za-z0-9À-ɏ]/.test(c);

const MIRROR: Record<string, string> = {
	'(': ')',
	')': '(',
	'[': ']',
	']': '[',
	'{': '}',
	'}': '{',
	'<': '>',
	'>': '<',
};

type Run = {dir: 'rtl' | 'ltr' | 'n'; text: string};

export const toVisualOrder = (logical: string): string => {
	const runs: Run[] = [];
	for (const ch of Array.from(logical)) {
		const dir: Run['dir'] = isRtl(ch) ? 'rtl' : isLtr(ch) ? 'ltr' : 'n';
		const last = runs[runs.length - 1];
		if (last && last.dir === dir) {
			last.text += ch;
		} else {
			runs.push({dir, text: ch});
		}
	}
	// resolve neutrals
	const resolved = runs.map((r, i) => {
		if (r.dir !== 'n') return r;
		const prev = runs[i - 1];
		const next = runs[i + 1];
		const between = prev?.dir === 'ltr' && next?.dir === 'ltr';
		return {dir: between ? 'ltr' : 'rtl', text: r.text} as Run;
	});
	// merge neighbours with the same direction
	const merged: Run[] = [];
	for (const r of resolved) {
		const last = merged[merged.length - 1];
		if (last && last.dir === r.dir) last.text += r.text;
		else merged.push({...r});
	}
	return merged
		.reverse()
		.map((r) =>
			r.dir === 'rtl'
				? Array.from(r.text)
						.reverse()
						.map((c) => MIRROR[c] ?? c)
						.join('')
				: r.text,
		)
		.join('');
};
