import { dirname, join } from 'path';
import { URL } from 'url';
import { asyncProcess } from '../utils/scriptUtils.js';
const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
console.log(__dirname);
debugger;
(async () => {
    // =================================
    // ===== Template Installation =====
    // =================================
    try {
        console.log('Installing Client dependencies');
        await asyncProcess('yarn', {
            cwd: join(__dirname, 'client'),
            shell: true,
        })[0];
    }
    catch (e) {
        console.error('Could not install client dependencies.');
        console.error(e);
    }
    try {
        console.log('Installing Server dependencies');
        await asyncProcess('yarn', {
            cwd: join(__dirname, 'server'),
            shell: true,
        })[0];
    }
    catch (e) {
        console.error('Could not install server dependencies.');
        console.error(e);
    }
    console.log('Done :D');
    process.exit(0);
})();
