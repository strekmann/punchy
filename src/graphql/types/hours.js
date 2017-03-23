import {
    GraphQLFloat,
    GraphQLString,
    GraphQLObjectType,
} from 'graphql';
import GraphQLDate from 'graphql-custom-datetype';
import {
    globalIdField,
    connectionArgs,
    connectionDefinitions,
} from 'graphql-relay';

import model from '../../models/hours';

import project from './project';
import user from './user';

const type = new GraphQLObjectType({
    name: 'Hours',
    description: 'Hours is the registration object saved to the database. Silly name, I know.',
    fields: () => {
        return {
            id: globalIdField('Hours'),
            user: {
                type: user.type,
            },
            project: {
                type: project.type,
            },
            date: { type: GraphQLDate },
            start: { type: GraphQLDate },
            end: { type: GraphQLDate },
            duration: { type: GraphQLFloat },
            comment: { type: GraphQLString },
        };
    },
});

const {
    connectionType: connection,
    edgeType: edge,
} = connectionDefinitions({ name: 'Hours', nodeType: type });

const args = connectionArgs;

export default {
    args,
    connection,
    edge,
    model,
    type,
};
