import {loadFont as loadHeebo} from '@remotion/google-fonts/Heebo';
import {loadFont as loadSecular} from '@remotion/google-fonts/SecularOne';

// DOM fonts (labels, CTA, DOM title fallback). The 3D title uses the TTF in
// public/fonts because three.js needs real glyph outlines, not a web font.
export const heebo = loadHeebo('normal', {weights: ['400', '700', '900'], subsets: ['hebrew', 'latin']}).fontFamily;
export const secular = loadSecular('normal', {weights: ['400'], subsets: ['hebrew', 'latin']}).fontFamily;
