import React from 'react';
import {Composition} from 'remotion';
import {EndCard, type EndCardProps} from './scenes/EndCard';
import {LaptopIntro, type LaptopIntroProps} from './scenes/LaptopIntro';
import {PhoneIntro, type PhoneIntroProps} from './scenes/PhoneIntro';

const FPS = 30;
const W = 1080;
const H = 1920;

// Defaults are what Studio shows. Override per render with --props=props/my.json
const phoneDefaults: PhoneIntroProps = {
	look: 'studio-dark',
	titleLines: ['הסוכן שעובד', 'גם כשאתם ישנים'],
	kicker: 'Claude Code בעברית',
	videoSrc: '', // put the student's video in public/ and write its name here, e.g. 'screen.mp4'
	videoStartSec: 0,
	volume: 1,
	handoff: true,
	titleMode: '3d',
	accent: '',
	frameColor: '',
	durationSec: 11,
};

const laptopDefaults: LaptopIntroProps = {
	look: 'studio-dark',
	titleLines: ['ככה זה נראה', 'מבפנים'],
	kicker: 'הדגמה מהמחשב',
	videoSrc: '',
	videoStartSec: 0,
	volume: 0,
	fit: 'contain',
	titleMode: '3d',
	accent: '',
	frameColor: '',
	durationSec: 10,
};

const endDefaults: EndCardProps = {
	look: 'studio-dark',
	titleLines: ['רוצים את ההוראה?'],
	cta: 'תגיבו "עובד" ואני שולח לכם',
	handle: '',
	logo: '',
	titleMode: '3d',
	accent: '',
	durationSec: 5,
};

const dur = (sec: number | undefined, fallback: number, min: number) => Math.round(Math.max(min, sec ?? fallback) * FPS);

export const Root: React.FC = () => (
	<>
		<Composition
			id="PhoneIntro"
			component={PhoneIntro}
			width={W}
			height={H}
			fps={FPS}
			durationInFrames={11 * FPS}
			defaultProps={phoneDefaults}
			calculateMetadata={({props}) => ({durationInFrames: dur(props.durationSec, 11, 6)})}
		/>
		<Composition
			id="LaptopIntro"
			component={LaptopIntro}
			width={W}
			height={H}
			fps={FPS}
			durationInFrames={10 * FPS}
			defaultProps={laptopDefaults}
			calculateMetadata={({props}) => ({durationInFrames: dur(props.durationSec, 10, 5)})}
		/>
		<Composition
			id="EndCard"
			component={EndCard}
			width={W}
			height={H}
			fps={FPS}
			durationInFrames={5 * FPS}
			defaultProps={endDefaults}
			calculateMetadata={({props}) => ({durationInFrames: dur(props.durationSec, 5, 3)})}
		/>
	</>
);
