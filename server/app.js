import express from 'express';
import cors from 'cors';
import https from 'https';
import { join, resolve, dirname } from 'path';
import { cwd } from 'process';
import http from 'http';
import { config } from 'dotenv';
import { createWriteStream, readFileSync } from 'fs';
import morgan from 'morgan';
config();

const SECURE_PORT = 8081;
const UPGRADE_PORT = 8080;
const DEV_PORT = 5050;

const isProd = process.env.NODE_ENV === 'production';
const secureServerPort = isProd ? SECURE_PORT : DEV_PORT;
const upgradeServerPort = UPGRADE_PORT;

// CAREFUL, BREAKS ON SPACES
const __dirname = dirname(new URL(import.meta.url).pathname);
const domain = process.env.DOMAIN ? process.env.DOMAIN : 'localhost';
const subDom = process.env.SUBDOMAIN ? process.env.SUBDOMAIN : '';
const domExt = process.env.DOMAIN_EXTENSION ? process.env.DOMAIN_EXTENSION : '';
const hostname = [subDom, domain, domExt].filter(c => !!c).join('.');

const app = express();

const logStream = createWriteStream(join(__dirname, 'access.log'), { flags: 'a' });
const myDate = new Date();

morgan.token('time', () => {
	return myDate.toISOString();
});

const logger = morgan(':time :url :method :remote-addr :user-agent :response-time ms', {
	stream: logStream,
});

app.disable('x-powered-by');

const allowedOrigins = [`https://${hostname}`];
if (!isProd) allowedOrigins.push('http://localhost:5000', 'http://127.0.0.1:5000');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//mongoose.connect(keys.mongoose, { useNewUrlParser: true, useUnifiedTopology: true });

app.use((req, res, next) => {
	res.header('X-XSS-Protection', '1; mode=block');
	res.header('X-Frame-Options', 'deny');
	res.header('X-Content-Type-Options', 'nosniff');
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header(
		'Access-Control-Allow-Origin',
		isProd ? `https://${hostname}` : 'localhost:5000'
	);
	next();
});

app.use(
	cors({
		origin: (origin, cb) => {
			if (!allowedOrigins.includes(origin)) {
				const msg = `The CORS policy doesn't allow access from ${origin}.`;
				return cb(msg, false);
			}
			return cb(null, true);
		},
	})
);

app.use(logger);

if (isProd) {
	app.use((req, res, next) => {
		if (req.hostname.startsWith(`${subDom}.`)) return next();
		res.redirect(301, `https://${subDom}.${req.hostname}${req.url}`);
	});
}

app.get('/public/*', (req, res) => {
	res.sendFile(resolve(cwd(), join('../client', 'dist', req.url)));
});

app.get('*', (req, res) => {
	res.sendFile(resolve(cwd(), '../client', 'dist', 'index.html'));
});

if (isProd) {
	http
		.createServer((req, res) => {
			console.log('Redirecting to: ', `https://${hostname}${req.url}`);
			logger(req, res, err => {
				if (err) console.error(err);
				res
					.writeHead(301, {
						Location: `https://${hostname}${req.url}`,
					})
					.end();
			});
		})
		.listen(upgradeServerPort, () => {
			console.log(`Http upgrade server online on port ${upgradeServerPort}`);
		});

	https
		.createServer(
			{
				key: readFileSync(resolve(cwd(), 'cert', 'privkey.pem')),
				cert: readFileSync(resolve(cwd(), 'cert', 'fullchain.pem')),
			},
			app
		)
		.listen(secureServerPort, () => {
			console.log(`Secure Server is listening on port ${secureServerPort}`);
		});
} else {
	app.listen(secureServerPort, () => {
		console.log(`Dev server is listening on port ${secureServerPort}`);
	});
}
