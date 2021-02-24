/* Contents
 * 1. Template Dependency Installation (download dependencies from npm)
 * 2. Creating Required Server Files   (key files, ssl certificates)
 * 3. Setting Up Dev Environment       (custom local domain resolution)
 * 4. Type Generation GQL              (build types from gql schema for server and client)
 */
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { URL } from 'url';
import { asyncProcess, useReadLine, createKeyFileString, parseHosts, setupSSLKey, yesNoQuestion, } from '../utils/scriptUtils.js';
import { writeFile, mkdir, readFile } from 'fs/promises';
const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const asyncReadLine = useReadLine(process.stdin, process.stdout);
const emptyEqualVals = (key, obj1, obj2) => {
    if (!obj1[key] && obj1[key] === obj2[key])
        return true;
    return false;
};
const anyNonFalsyUserResponse = userInput => {
    const falsy = ['n', 'no', 'N', 'No'];
    return [userInput.length > 0, !falsy.includes(userInput)];
};
// ============================================
// ===== Template Dependency Installation =====
// ============================================
try {
    console.log('Installing Client dependencies');
    await asyncProcess('yarn', {
        cwd: join(__dirname, '../client'),
        shell: true,
    })[0];
    console.log('Installed Client Deps ...');
    console.clear();
}
catch (e) {
    console.error('Could not install client dependencies.');
    console.error(e);
}
try {
    console.log('Installing Server dependencies');
    await asyncProcess('yarn', {
        cwd: join(__dirname, '../server'),
        shell: true,
    })[0];
    console.log('Installed Server Deps ...');
    console.clear();
}
catch (e) {
    console.error('Could not install server dependencies.');
    console.error(e);
}
// ==========================================
// ===== Creating Required Server Files =====
// ==========================================
console.log('Starting Template Servers Setup ...');
// Write all required keys
try {
    if (existsSync(join(__dirname, '../server/keys/keys.ts')))
        throw 'Keyfile already exists';
    await mkdir(join(__dirname, '../server/keys'), { recursive: true });
}
catch (e) {
    console.error('Could not create key file');
    console.error(e);
}
// default key values
const defaultKeys = {
    mongooseKey: '',
    mongoSessionCollectionName: 'sessions',
    googleSecret: '',
    googleKey: '',
    sessionSecret: '1234',
};
// @ts-ignore
const imported_keys = await import('../server/keys/keys.js');
// @ts-ignore
const keys = {};
// Override empty / non existing keys with default values
for (const key in defaultKeys) {
    const keyValue = imported_keys[key];
    if (!keyValue)
        keys[key] = defaultKeys[key];
    keys[key] = keyValue;
}
const dontReadKey = (key) => !emptyEqualVals(key, keys, defaultKeys);
// Mongoose Key
try {
    console.clear();
    if (dontReadKey('mongooseKey'))
        throw 'Mongoose Key already present, Skipping ...';
    console.log('You can create a free Account here : (https://account.mongodb.com/account/login)');
    keys.mongooseKey = await asyncReadLine('Please provide the connection URI for the MongoDB database (mongodb+srv://<Username>:<Password>@...) :');
    console.clear();
}
catch (e) {
    console.log('Failed to read mongooseKeys');
    console.error(e);
}
try {
    console.clear();
    if (dontReadKey('mongoSessionCollectionName'))
        throw 'Session Collection Name present, Skipping ...';
    const [writeSessionName, sessionName] = await yesNoQuestion(`Would you like to change the default collection (${keys.mongoSessionCollectionName}) where your sessions are going to be stored under ?
(n / typeInTheSessionCollectionName)`, asyncReadLine, {
        ignoreDefaultValidation: true,
        validateFn: anyNonFalsyUserResponse,
    });
    if (writeSessionName)
        keys.mongoSessionCollectionName = sessionName;
    console.clear();
}
catch (e) {
    console.log('Failed to read Session Name');
    console.error(e);
}
// Google Keys
try {
    console.clear();
    if (dontReadKey('googleSecret'))
        throw 'Google Secret already exists, Skipping ...';
    console.log('You can create an Google Application here : (https://console.developers.google.com/apis/credentials)');
    keys.googleSecret = await asyncReadLine('Please provide the Google Secret for the Template:');
}
catch (e) {
    console.log('Failed to read googleSecret');
    console.error(e);
}
try {
    console.clear();
    if (dontReadKey('googleKey'))
        throw 'Google Secret already exists, Skipping ...';
    console.log('You can create an Google Application here : (https://console.developers.google.com/apis/credentials)');
    keys.googleKey = await asyncReadLine('Please provide the Google Key for for the Template:');
    console.clear();
}
catch (e) {
    console.log('Failed to read googleKey');
    console.error(e);
}
// Session secret
try {
    console.clear();
    if (dontReadKey('sessionSecret'))
        throw 'Session Secret already set, Skipping ...';
    const [writeSessionSecret, sessionSecret] = await yesNoQuestion(`Would you like to change the default cookie session secret (${keys.sessionSecret}) ?
Any random string will do - you can create ono on this website (not recommended for production runs) : set the length to ~80 : (https://passwordsgenerator.net/)
(n / pasteSessionSecret)
`, asyncReadLine, { validateFn: anyNonFalsyUserResponse });
    if (!writeSessionSecret)
        throw 'Keeping default value.';
    keys.sessionSecret = sessionSecret;
    console.clear();
}
catch (e) {
    console.log('Failed to update sessionSecret');
    console.error(e);
}
try {
    console.log('Writing key files ...');
    const writtenFiles = await Promise.allSettled([
        writeFile(join(__dirname, '../server/keys/keys.ts'), createKeyFileString(keys)),
        writeFile(join(__dirname, '../server/keys/keys.js'), createKeyFileString(keys)),
    ]);
    for (const result of writtenFiles) {
        if (result.status === 'rejected')
            throw 'Failed to write a file';
    }
    console.log('Written key files.');
}
catch (e) {
    console.error(e);
    console.error('Could not write to key-file.');
}
// Write SSL Certificates
try {
    console.clear();
    if (!existsSync(join(__dirname, '../server/cert/fullchain.pem'))) {
        console.log("Couldn't find the fullchain.pem.");
        console.log('If you are only going to run the server in http debug mode, you will not need this ssl key.');
        const input = await asyncReadLine("If you don't need ssl just press enter, otherwise paste the key");
        await setupSSLKey(input);
        console.clear();
    }
}
catch (e) {
    console.log('Did not create a fullchain.pem');
    console.log(e);
}
try {
    console.clear();
    if (!existsSync(join(__dirname, '../server/cert/privkey.pem'))) {
        console.log("Couldn't find the privkey.pem");
        console.log('If you are only going to run the server in http debug mode, you will not need this ssl key.');
        const input = await asyncReadLine("If you don't need ssl just press enter, otherwise paste the key");
        await setupSSLKey(input);
    }
    console.clear();
}
catch (e) {
    console.log('Did not create a privkey.pem');
    console.log(e);
}
// ======================================
// ===== Setting Up Dev Environment =====
// ======================================
try {
    console.clear();
    const setupDevUrl = (await yesNoQuestion(`Do you want to setup a custom development domain ? - This will only affect your local development environment.

For this to work you need to run this process as admin, if you didn't just exit the process and restart it with: 
(linux : sudo node ./setup.js, windows: runas /user:”your_computer_name\administrator_name” node ./setup.js)

(y/n)
`, asyncReadLine))[0];
    if (!setupDevUrl)
        throw "User doesn't want to setup a dev url, dev url will be localhost";
    let hostsFile;
    let hostsFilePath;
    const winHostsFilePath = 'C:/Windows/System32/drivers/etc/hosts';
    const linHostsFilePath = '/etc/hosts';
    switch (process.platform) {
        case 'win32':
            hostsFile = (await readFile(winHostsFilePath)).toString();
            hostsFilePath = winHostsFilePath;
            break;
        case 'linux': {
            hostsFile = (await readFile(linHostsFilePath)).toString();
            hostsFilePath = linHostsFilePath;
            break;
        }
        default:
            throw `Operating System: ${process.platform} not supported.`;
    }
    if (hostsFile === undefined || linHostsFilePath === undefined)
        throw 'Either empty hosts-file or could not find hosts file. You will have to change it manually yourself.';
    const hostFileData = parseHosts(hostsFile);
    console.log("These are your hostfile's contents :\n");
    console.log(hostsFile + '\n');
    const usersHostname = (await asyncReadLine('Please type in your desired hostname: ')).trim();
    const ipToAssign = '127.0.0.1';
    const identicalHostEntryExists = hostFileData.reduce((acc, [ip, rawHostname]) => {
        for (const hostname of rawHostname.split(' ')) {
            if (hostname === usersHostname && ip.trim() === ipToAssign)
                return true;
        }
        return acc;
    }, false);
    if (identicalHostEntryExists)
        throw 'Identical Hosts entry already exists, skipping ...';
    const hostEntry = `\n${ipToAssign}  ${usersHostname}`;
    console.log(`Trying to write ${hostEntry} to the hosts file`);
    await writeFile(hostsFilePath, hostEntry, { flag: 'a' });
    console.log('Wrote successfully');
    console.clear();
}
catch (e) {
    console.error(e);
    console.error('Was not able to setup dev url');
}
console.log('Configuration of the template completed');
// ================================
// ===== Type Generation GQL  =====
// ================================
console.log('\n================================\n');
console.log('Generating types for graphql ...');
console.log('Building the development server ...');
try {
    await asyncProcess('yarn debug', {
        shell: true,
        cwd: join(__dirname, '../server'),
        outputNeedsToEqual: 'Watching for file changes',
        ignoreErrors: true,
    })[0];
    console.log('Server has been built, starting the server.');
}
catch (e) {
    console.log("Couldn't build the server ...");
    console.error(e);
}
let debugServerProc;
try {
    const [debugServerLock, _debugServerProc] = asyncProcess('node ../server/dist/src/app.js', {
        shell: true,
        cwd: join(__dirname, '../server'),
        outputNeedsToEqual: 'Dev server is listening on port',
        ignoreErrors: true,
    });
    debugServerProc = _debugServerProc;
    await debugServerLock;
    console.log('Server has started successfully, generating the gql types now.');
}
catch (e) {
    console.log("Couldn't start the server");
    console.error(e);
}
try {
    await asyncProcess('yarn gql:codegen', {
        shell: true,
        cwd: join(__dirname, '../server'),
    })[0];
    console.log('GQL Types for the server have been generated.');
}
catch (e) {
    console.log("Couldn't generate servers' gql types");
    console.error(e);
}
try {
    await asyncProcess('yarn gql:codegen', {
        shell: true,
        cwd: join(__dirname, '../client'),
    })[0];
    console.log('GQL Types for the client have been generated.');
}
catch (e) {
    console.log("Couldn't generate clients' gql types");
    console.error(e);
}
console.log('Attempting to close the server now since all types have been built ...');
debugServerProc && debugServerProc.kill();
console.log('Setup completed');
process.exit(0);
