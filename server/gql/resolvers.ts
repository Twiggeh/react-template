import { UploadFileResolver, UploadFilesResolver } from './UploadFileResolver.js';
import { GraphQLUpload } from 'graphql-upload';
import { Date } from './DateResolver.js';
import { Resolvers } from '../generated/gql';
import { IResolvers } from 'apollo-server-express';

const resolvers: Resolvers = {
	Upload: GraphQLUpload,
	Date: Date,
	Query: {},
	Mutation: {
		uploadFile: UploadFileResolver,
		uploadFiles: UploadFilesResolver,
	},
	UploadFileResult: {
		__resolveType(obj) {
			console.log('uploadFile', obj);
			return obj.__typename;
		},
	},
};

export default resolvers as IResolvers;
