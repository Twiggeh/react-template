/* Contents
 * 1. Template Dependency Installation
 * 2. Creating Required Files
 * 3. Type Generation GQL
 */

import { chmodSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { URL } from 'url';
import { asyncProcess, useReadLine, createKeyFileString } from '../utils/scriptUtils.js';

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const asyncReadLine = useReadLine(process.stdin, process.stdout);

(async () => {
	// ============================================
	// ===== Template Dependency Installation =====
	// ============================================

	try {
		console.log('Installing Client dependencies');
		await asyncProcess('yarn', {
			cwd: join(__dirname, '../client'),
			shell: true,
		})[0];
	} catch (e) {
		console.error('Could not install client dependencies.');
		console.error(e);
	}

	try {
		console.log('Installing Server dependencies');
		await asyncProcess('yarn', {
			cwd: join(__dirname, '../server'),
			shell: true,
		})[0];
	} catch (e) {
		console.error('Could not install server dependencies.');
		console.error(e);
	}

	// ===================================
	// ===== Creating Required Files =====
	// ===================================

	console.log('Starting Template Servers Setup ...');

	// Write all required keys
	if (!existsSync(join(__dirname, '../server/keys/keys.ts'))) {
		mkdirSync(join(__dirname, '../server/keys'), { recursive: true });

		const variables = {
			mongooseKey: '',
			googleSecret: '',
			googleKey: '',
			sessionSecret: '',
		};

		// Mongoose Key
		try {
			console.log(
				'You can create a free Account here : (https://account.mongodb.com/account/login)'
			);
			variables.mongooseKey = await asyncReadLine(
				'Please provide the connection URI for the MongoDB database (mongodb+srv://<Username>:<Password>@...) :'
			);
			console.clear();
		} catch (e) {
			console.log('Failed to read mongooseKey');
			console.error(e);
		}
		// Google Keys
		try {
			console.log(
				'You can create an Google Application here : (https://console.developers.google.com/apis/credentials)'
			);
			variables.googleSecret = await asyncReadLine(
				'Please provide the Google Secret for the Template:'
			);
			variables.googleKey = await asyncReadLine(
				'Please provide the Google Key for for the Template:'
			);
			console.clear();
		} catch (e) {
			console.log('Failed to read googleSecret or googleKey');
			console.error(e);
		}
		// Session secret
		try {
			console.log(
				'You can create a random key on this website, set the length to ~80 : (https://passwordsgenerator.net/)'
			);
			variables.sessionSecret = await asyncReadLine(
				'Please Provide a key to encrypt the Imgur Clone Sessions with (any random string) :'
			);
			console.clear();
		} catch (e) {
			console.log('Failed to read sessionSecret');
			console.error(e);
		}
		console.log('Writing keys ...');

		writeFileSync(
			join(__dirname, '../server/keys/keys.ts'),
			createKeyFileString(variables)
		);
		console.log('Written key file.');
	}

	// Create SSL Certificates

	const setupSSLKey = async (
		input: string,
		keyFileLocation?: string,
		keyFileName?: string
	) => {
		input = input.trim();
		const type: 'fullchain' | 'privkey' | 'bad input' =
			input.startsWith('-----BEGIN CERTIFICATE-----') &&
			input.endsWith('-----END CERTIFICATE-----')
				? 'fullchain'
				: input.startsWith('-----BEGIN PRIVATE KEY-----') &&
				  input.endsWith('-----END PRIVATE KEY-----')
				? 'privkey'
				: 'bad input';
		if (type === 'bad input')
			throw 'Bad input, not writing key. If you need ssl, please put the keys under server/cert/privkey.pem and server/cert/fullchain.pem.\n Do not forget that the folder needs to have be chmoded to 700, the privkey needs to be chmoded to 600 and the fullchain needs to be chmoded to 644 for the server to work. ';

		keyFileLocation === undefined
			? (keyFileLocation = join(__dirname, '../server/cert/'))
			: keyFileLocation;
		keyFileName === undefined
			? (keyFileName = type === 'fullchain' ? 'fullchain.pem' : 'privkey.pem')
			: keyFileName;
		const keyFilePath = join(keyFileLocation, keyFileName);
		const keyFilePermission = type === 'fullchain' ? 644 : 600;
		const keyFileLocationPermission = 700;

		console.log(`Writing ${keyFileName} ...`);
		mkdirSync(keyFileLocation);
		writeFileSync(keyFilePath, input);
		console.log(`Wrote ${keyFileName}, updating permissions of ${keyFileName}`);

		chmodSync(keyFileLocation, keyFileLocationPermission);
		console.log(
			`Set the permissions for the cert folder to ${keyFileLocationPermission}`
		);

		chmodSync(keyFilePath, keyFilePermission);
		console.log(
			`Set the permissions for the (${keyFileName}) ssl key to ${keyFilePermission}`
		);
	};

	try {
		if (!existsSync(join(__dirname, '../server/cert/fullchain.pem'))) {
			console.log("Couldn't find the fullchain.pem.");
			console.log(
				'If you are only going to run the server in http debug mode, you will not need this ssl key.'
			);
			const input = await asyncReadLine(
				"If you don't need ssl just press enter, otherwise paste the key"
			);
			await setupSSLKey(input);
		}
	} catch (e) {
		console.log('Did not create a fullchain.pem');
		console.log(e);
	}

	try {
		if (!existsSync(join(__dirname, '../server/cert/privkey.pem'))) {
			console.log("Couldn't find the privkey.pem");
			console.log(
				'If you are only going to run the server in http debug mode, you will not need this ssl key.'
			);
			const input = await asyncReadLine(
				"If you don't need ssl just press enter, otherwise paste the key"
			);
			await setupSSLKey(input);
		}
	} catch (e) {
		console.log('Did not create a privkey.pem');
		console.log(e);
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
	} catch (e) {
		console.log("Couldn't build the server ...");
		console.error(e);
	}

	let debugServerProc: undefined | ReturnType<typeof asyncProcess>['1'];
	try {
		const [debugServerLock, _debugServerProc] = asyncProcess(
			'node ../server/dist/src/app.js',
			{
				shell: true,
				cwd: join(__dirname, '../server'),
				outputNeedsToEqual: 'Dev server is listening on port',
				ignoreErrors: true,
			}
		);
		debugServerProc = _debugServerProc;

		await debugServerLock;

		console.log('Server has started successfully, generating the gql types now.');
	} catch (e) {
		console.log("Couldn't start the server");
		console.error(e);
	}

	try {
		await asyncProcess('yarn gql:codegen', {
			shell: true,
			cwd: join(__dirname, '../server'),
		})[0];

		console.log('GQL Types for the server have been generated.');
	} catch (e) {
		console.log("Couldn't generate servers' gql types");
		console.error(e);
	}

	try {
		await asyncProcess('yarn gql:codegen', {
			shell: true,
			cwd: join(__dirname, '../client'),
		})[0];

		console.log('GQL Types for the client have been generated.');
	} catch (e) {
		console.log("Couldn't generate clients' gql types");
		console.error(e);
	}
	console.log('Attempting to close the server now since all types have been built ...');

	debugServerProc && debugServerProc.kill();

	console.log('Setup completed');

	process.exit(0);
})();
