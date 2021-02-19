import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { URL } from 'url';
import { processParams } from './processParameters.js';
import { asyncProcess } from '../../utils/scriptUtils.js';
const defaultDebugCfg = {
    domain: 'localhost',
    domainExt: '',
    subDomain: '',
    securePort: '8080',
    insecurePort: '8081',
    devPort: '5050',
    backendProtocol: 'http',
};
const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const { domain, subDomain, domainExt, insecurePort, devPort, securePort, backendProtocol, } = processParams(process.argv, defaultDebugCfg);
let envFileContent = '';
const addEnvContent = (newContent) => void (envFileContent += newContent + '\n');
addEnvContent('NODE_ENV=development');
addEnvContent(`SERVER_DIR=${join(__dirname, '..')}`);
addEnvContent(`DOMAIN="${domain}"`);
addEnvContent(`SUBDOMAIN="${subDomain}"`);
addEnvContent(`DOMAINEXTENSION="${domainExt}"`);
addEnvContent(`SECURE_PORT="${securePort}"`);
addEnvContent(`DEV_PORT="${devPort}"`);
addEnvContent(`INSECURE_PORT="${insecurePort}"`);
addEnvContent(`BACKEND_PROTOCOL="${backendProtocol}"`);
mkdirSync(join(__dirname, '..', 'public/uploads'), { recursive: true });
mkdirSync(join(__dirname, '..', 'dist/public/uploads'), { recursive: true });
writeFileSync(join(__dirname, '../.env'), envFileContent);
asyncProcess('tsc -w', { cwd: join(__dirname, '..'), shell: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWJ1Zy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLElBQUksQ0FBQztBQUM5QyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQzFCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFMUQsTUFBTSxlQUFlLEdBQUc7SUFDdkIsTUFBTSxFQUFFLFdBQVc7SUFDbkIsU0FBUyxFQUFFLEVBQUU7SUFDYixTQUFTLEVBQUUsRUFBRTtJQUNiLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsZUFBZSxFQUFFLE1BQU07Q0FDdkIsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBRXhFLE1BQU0sRUFDTCxNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLEVBQ1osT0FBTyxFQUNQLFVBQVUsRUFDVixlQUFlLEdBQ2YsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQztBQUVqRCxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDeEIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxVQUFrQixFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUd6RixhQUFhLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUN0QyxhQUFhLENBQUMsY0FBYyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUdyRCxhQUFhLENBQUMsV0FBVyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLGFBQWEsQ0FBQyxjQUFjLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDMUMsYUFBYSxDQUFDLG9CQUFvQixTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBR2hELGFBQWEsQ0FBQyxnQkFBZ0IsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUM3QyxhQUFhLENBQUMsYUFBYSxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZDLGFBQWEsQ0FBQyxrQkFBa0IsWUFBWSxHQUFHLENBQUMsQ0FBQztBQUlqRCxhQUFhLENBQUMscUJBQXFCLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFHdkQsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN4RSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUscUJBQXFCLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRzdFLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBRTFELFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyJ9