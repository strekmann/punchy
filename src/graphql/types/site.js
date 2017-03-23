import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import {
    connectionArgs,
} from 'graphql-relay';

import {
    connectionFromMongooseQuery,
} from '../connections/mongoose';
import Organization from '../../models/organization';
import Project from '../../models/project';

import project from './project';
import user from './user';

const type = new GraphQLObjectType({
    name: 'Site',
    description: 'I R Punchy',
    fields: () => {
        return {
            name: {
                type: GraphQLString,
            },
            viewer: {
                type: user.type,
                resolve: (_, args, { viewer }) => {
                    return viewer;
                },
            },
            projects: {
                type: project.connection,
                args: connectionArgs,
                resolve: (_, args, { viewer }) => {
                    if (!viewer) {
                        return null;
                    }
                    return Organization.find({ users: viewer.id }).exec()
                    .then((organizations) => {
                        return connectionFromMongooseQuery(
                            Project.find({}).where('organization').in(organizations.map((org) => {
                                return org._id;
                            })),
                            args,
                        );
                    });
                },
            },
        };
    },
});

export default {
    type,
};
