import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const processes = [spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' }), spawn(process.execPath, [fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)), ...process.argv.slice(2)], { stdio: 'inherit' })];
let stopping = false;
function stop(code = 0) { if (stopping) return; stopping = true; processes.forEach(child => child.kill()); process.exitCode = code; }
processes.forEach(child => { child.on('error', error => { console.error(error.message); stop(1); }); child.on('exit', code => stop(code || 0)); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
