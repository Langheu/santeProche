import { build } from 'vite';
import { buildPwa } from './pwa-build.js';
await build();
buildPwa('dist');
