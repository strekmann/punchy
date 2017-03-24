import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import {
    connectionFromMongooseQuery,
} from '../connections/mongoose';

import organization from './organization';
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
                args: project.args,
                resolve: (_, args, { viewer }) => {
                    if (!viewer) {
                        return null;
                    }
                    return organization.model.find({ users: viewer.id }).exec()
                    .then((organizations) => {
                        return connectionFromMongooseQuery(
                            project.model.find({}).where('organization').in(organizations.map((org) => {
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
