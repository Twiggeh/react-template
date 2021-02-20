import { gql } from 'apollo-server-express';
import { AddUserType } from './AddUserType.js';
import { UploadFileType } from './UploadFileType.js';

const typeDefs = gql`
	scalar Upload
	scalar Date
	type Query {
		_empty: String
	}
	type Mutation {
		_empty: String
	}
	${UploadFileType}
	${AddUserType}
`;

export default typeDefs;
