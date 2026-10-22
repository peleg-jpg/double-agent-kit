import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';
import {Font} from 'three/examples/jsm/loaders/FontLoader.js';
import {TTFLoader} from 'three/examples/jsm/loaders/TTFLoader.js';

// Loads a .ttf/.otf from public/ and converts it to a three.js Font at runtime
// (opentype.js inside TTFLoader). Rendering waits until the font is ready.
// Must be a TTF or OTF: woff2 does not work here.
export const useFont3D = (file = 'fonts/SecularOne-Regular.ttf') => {
	const [font, setFont] = useState<Font | null>(null);
	const [handle] = useState(() => delayRender(`3D font ${file}`));
	useEffect(() => {
		new TTFLoader().load(
			staticFile(file),
			(json) => {
				setFont(new Font(json as never));
				continueRender(handle);
			},
			undefined,
			(err) => cancelRender(err),
		);
	}, [file, handle]);
	return font;
};
