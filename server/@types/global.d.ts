import { Request } from 'express';
import { Session, SessionData } from 'express-session';
import { FileUpload } from 'graphql-upload';

interface AuthReq extends Request {
	session: SessionCtx;
}

type SessionCtx = {
	grant?: {
		response: {
			access_token: string;
			refresh_token: string;
		};
	};
	userId?: string;
	noAccountPosts?: string[];
} & Session &
	Partial<SessionData>;

interface MyContext {
	currentUser?: undefined;
	req: AuthReq;
}

type File = Promise<FileUpload>;
