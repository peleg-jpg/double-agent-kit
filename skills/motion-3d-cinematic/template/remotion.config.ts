import {Config} from '@remotion/cli/config';

// WebGL needs a GL backend in headless Chrome. Without one, renders fail with
// "Error creating WebGL context". 'angle' uses the GPU (Mac and Windows, fast).
// On a machine with no GPU (Linux server, some VMs) use --gl=swangle (software, about 1 s per frame).
Config.setChromiumOpenGlRenderer('angle');
Config.setConcurrency(null);
