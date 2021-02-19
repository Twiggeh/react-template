import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { URL } from 'url';
import { asyncProcess } from '../../utils/scriptUtils.js';
import { processParams } from './processParameters.js';

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));

const defaultBuildCfg = {
	domain: 'localhost',
	domainExt: '',
	subDomain: '',
	securePort: '8080',
	insecurePort: '8081',
	devPort: '5050',
	backendProtocol: 'http',
};

const {
	domain,
	subDomain,
	domainExt,
	insecurePort,
	devPort,
	securePort,
	backendProtocol,
} = processParams(process.argv, defaultBuildCfg);

let envFileContent = '';
const addEnvContent = (newContent: string) => void (envFileContent += newContent + '\n');
// Set all environment variables, then run nodemon

addEnvContent('NODE_ENV=development');
addEnvContent(`SERVER_DIR=${join(__dirname, '..')}`);

// DOMAINS
addEnvContent(`DOMAIN="${domain}"`);
addEnvContent(`SUBDOMAIN="${subDomain}"`);
addEnvContent(`DOMAINEXTENSION="${domainExt}"`);

// PORTS
addEnvContent(`SECURE_PORT="${securePort}"`);
addEnvContent(`DEV_PORT="${devPort}"`);
addEnvContent(`INSECURE_PORT="${insecurePort}"`);
// TODO : add config for production to not use maps

// PROTOCOL
addEnvContent(`BACKEND_PROTOCOL="${backendProtocol}"`);

// DIRECTORIES
mkdirSync(join(__dirname, '..', 'public/uploads'), { recursive: true });
mkdirSync(join(__dirname, '..', 'dist/public/uploads'), { recursive: true });

// Write env file
writeFileSync(join(__dirname, '../.env'), envFileContent);

(async () => {
	console.log('Compiling the server ...');
	await asyncProcess('tsc', { shell: true, cwd: join(__dirname, '..') })[0];
	console.log('Server has been compiled.');
})();
