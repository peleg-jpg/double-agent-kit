import {Shape, ShapeGeometry} from 'three';

// Rounded rectangle centred on 0,0. Quadratic corners read closer to Apple's
// continuous corners than circular arcs.
export const roundedRect = (w: number, h: number, r: number) => {
	const x = -w / 2;
	const y = -h / 2;
	const s = new Shape();
	s.moveTo(x + r, y);
	s.lineTo(x + w - r, y);
	s.quadraticCurveTo(x + w, y, x + w, y + r);
	s.lineTo(x + w, y + h - r);
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	s.lineTo(x + r, y + h);
	s.quadraticCurveTo(x, y + h, x, y + h - r);
	s.lineTo(x, y + r);
	s.quadraticCurveTo(x, y, x + r, y);
	return s;
};

// ShapeGeometry gives UVs in world units. Remap to 0..1 so a texture fills it.
export const flatGeometry = (w: number, h: number, r: number, segments = 16) => {
	const g = new ShapeGeometry(roundedRect(w, h, r), segments);
	const pos = g.attributes.position;
	const uv = g.attributes.uv;
	for (let i = 0; i < pos.count; i++) {
		uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
	}
	uv.needsUpdate = true;
	return g;
};
