import { dirname, relative } from 'path';
import { stat, readFile } from 'fs/promises';
import { escapeRegex } from '../utils/scriptUtils.js';

const injectionData: InjectionData = {
	string: '__twig_generation',
	startSignifier: '[',
	stopSignifier: ']',
};

const extensionData: ExtensionData = {
	string: '__twig_extension',
	type: 'override',
	startSignifier: '[',
	stopSignifier: ']',
};

const objectExtension = (
	input: string,
	data: Record<string, unknown>,
	searcher: ExtensionData
) => {};

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));

const appPath = '../server/src/app.js';
const keyPath = '../server/keys/keys.js';
const scriptUtilsPath = '../utils/scriptUtils.js';

const availableImports = {
	default: {
		session: 'express-session',
		MongDBStoreConstructor: 'connect-mongodb-session',
	},
	named: {
		MemoryStore: 'express-session',
		sessionSecret: keyPath,
		mongoSessionCollectionName: keyPath,
		yesNoQuestion: scriptUtilsPath,
	},
};

/**
 * @param availableImportsPath - Access the availableImports Object with e.g. "default.session"
 * @param importIntoFilePath - Absolute File Path to the file that is going to receive the import
 */
const getRelativeImportPath: GetRelativeImportPath = (
	availableImportsPath,
	importIntoFilePath
) => {
	const [type, toBeImported] = availableImportsPath.split('.');

	const pathFromCodeGen = availableImports[type][toBeImported];

	if (pathFromCodeGen === undefined)
		throw `No such default import exists (type: ${type}, toBeImported: ${toBeImported})`;

	if (!pathFromCodeGen.startsWith('./'))
		return [pathFromCodeGen, { defaultImport: toBeImported }];

	const relativeImportPath = relative(importIntoFilePath, pathFromCodeGen);

	return [
		relativeImportPath,
		type === 'default' ? { defaultImport: toBeImported } : { namedImport: toBeImported },
	];
};

// For each file
//    process imports (pass file path, availableImport path)
// Pass files and then automatically import from a registrar

const processFiles = (directories: string[]) => {
	const parseFile = async (filepath: string) => {
		// does file exist
		try {
			await stat(filepath);
		} catch (e) {
			console.error(e);
			if (e.code === 'ENOENT') throw "File doesn't exist";
		}

		const fileData: {
			imports: {
				defaultImports: Record<string, string>;
				namedImports: Record<string, string>;
			};
			injections: string[];
			extensions: string[];
		} = {
			imports: { defaultImports: {}, namedImports: {} },
			injections: [],
			extensions: [],
		};

		// build already added imports
		try {
			const importRegex = /import\s*(\S* as \w*|\w*),?\s*(?:\{([\w\s,]*)\})?\s*from\s*["'](.*)["'][\n;]/g;
			const file = (await readFile(filepath)).toString();

			// TODO: Not sure whether the allExistingImports array is useful, replace map with forEach if it isn't
			const allExistingImports: ExistingImports[] = [
				...file.matchAll(importRegex),
			].map<ExistingImports>(([, defaultImport, namedImports, importedFrom]) => {
				// get all named imports
				const parsedNamedImports = namedImports
					.split(',')
					.map(namedImport => namedImport.trim());

				// populate the imports section of fileData
				if (defaultImport) {
					if (fileData.imports.defaultImports[defaultImport])
						throw `duplicate default import: ${defaultImport}`;
					fileData.imports.defaultImports[defaultImport] = importedFrom;
				}
				if (namedImports)
					for (const namedImport of parsedNamedImports) {
						if (fileData.imports.namedImports[namedImport])
							throw `duplicate named import: ${defaultImport}`;
						fileData.imports.namedImports[namedImport] = importedFrom;
					}

				return [defaultImport, parsedNamedImports, importedFrom];
			});

			// Create Regex out all injection / extension / etc data
			const holdRegexData: [string, string[], string] = ['/**s*', [], 's**/'];

			[injectionData, extensionData].forEach(
				({ startSignifier, stopSignifier, string }) => {
					holdRegexData[1].push(
						`${escapeRegex(string + startSignifier)}(.*)${escapeRegex(stopSignifier)}`
					);
				}
			);

			const injectExtendRegex = new RegExp(
				`${holdRegexData[0]}(${holdRegexData[1].join('|')})${holdRegexData[1]}`,
				'g'
			);

			const matchedCodeChanges = file.matchAll(injectExtendRegex);
		} catch (error) {
			console.error(error);
		}
	};

	for (const directory of directories) {
	}
};

getRelativeImportPath('default.session', 'hell');

export const useMongoDBSessions: CodeGenBlock<
	'yesNoQuestion' | 'session, { MemoryStore }' | 'MongoDBStoreConstructor'
> = [
	{
		requiredPackages: [
			'express-session',
			'connect-mongodb-session',
			'mongoose',
			'express',
		],
		injectionCode: [
			{
				signifier: 'Setup Sessions',
				code: `try {
      console.clear();
      if (dontReadKey('mongoSessionCollectionName'))
        throw 'Session Collection Name present, Skipping ...';
    
      const [writeSessionName, sessionName] = await yesNoQuestion(
        \`Would you like to change the default collection (\${keys.mongoSessionCollectionName}) where your sessions are going to be stored under ?
    (n / typeInTheSessionCollectionName)\`,
        asyncReadLine,
        {
          ignoreDefaultValidation: true,
          validateFn: anyNonFalsyUserResponse,
        }
      );
    
      if (writeSessionName) keys.mongoSessionCollectionName = sessionName;
    
      console.clear();
    } catch (e) {
      console.log('Failed to read Session Name');
      console.error(e);
    }
`,
			},
			{
				requiredImports: [''],
				signifier: 'Mongoose Session',
				code: `const MongoDBStore = MongoDBStoreConstructor(session);

app.use(
	session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			sameSite: 'lax',
		},
		store:
			mongooseKey === ''
				? new MemoryStore()
				: new MongoDBStore({
						uri: createUriWithCollectionName(mongooseKey, mongoSessionCollectionName),
						collection: 'sessions',
						connectionOptions: {
							useNewUrlParser: true,
							useUnifiedTopology: true,
						},
				  }),
	})
);
`,
			},
		],
		extensionCode: [
			{
				requiredImports: ['yesNoQuestion', scriptUtilsPath],
				signifier: 'Default Keys',
				code: { mongoSessionCollectionName: 'sessions' },
			},
		],
	},
];

type CodeGenBlock<Names, CodeGenType = string> = [
	{
		requiredPackages?: string[];
		injectionCode?: {
			signifier: string;
			code: string | CodeGenType;
			requiredImports?: (Names | string)[];
		}[];
		extensionCode?: {
			signifier: string;
			code: Record<string, unknown>;
			requiredImports?: (Names | string)[];
		}[];
	}
];

type InjectionData = {
	string: string;
	startSignifier: string;
	stopSignifier: string;
};

type ExtensionData = {
	string: string;
	type: 'merge' | 'override';
	startSignifier: string;
	stopSignifier: string;
};

type ToBeImported = { defaultImport: string } | { namedImport: string };

type GetRelativeImportPath = <
	T extends string & keyof typeof availableImports,
	U extends string & keyof typeof availableImports[T]
>(
	availableImportsPath: `${T}.${U}`,
	importIntoFilePath: string
) => [importPath: string, toBeImported: ToBeImported];

type ExistingImports = [
	defaultImport: string,
	namedImports: string[],
	importedFrom: string
];
