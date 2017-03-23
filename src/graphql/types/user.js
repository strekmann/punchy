import {
    GraphQLBoolean,
    GraphQLString,
    GraphQLObjectType,
} from 'graphql';
import GraphQLDate from 'graphql-custom-datetype';
import {
    globalIdField,
} from 'graphql-relay';

import model from '../../models/user';
import { connectionFromMongooseQuery } from '../connections/mongoose';
import { nodeInterface, register } from '../node';

import hours from './hours';

const type = new GraphQLObjectType({
    name: 'User',
    description: 'A user',
    fields: () => {
        return {
            id: globalIdField('User'),
            username: { type: GraphQLString },
            name: { type: GraphQLString },
            email: { type: GraphQLString },
            is_active: { type: GraphQLBoolean },
            is_admin: { type: GraphQLBoolean },
            created: { type: GraphQLDate },
            hours: {
                type: hours.connection,
                args: hours.args,
                resolve: (_, args, { viewer }) => {
                    return connectionFromMongooseQuery(
                        hours.model.find({ user: viewer.id }).sort('-created'),
                        args,
                    );
                },
            },
        };
    },
    interfaces: [nodeInterface],
});

register(type, (id, { viewer }) => {
    return model.findById(id).exec();
});

export default {
    model,
    type,
};
