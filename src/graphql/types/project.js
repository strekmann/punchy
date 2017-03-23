import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import {
    connectionDefinitions,
    globalIdField,
} from 'graphql-relay';

import model from '../../models/project';
import { nodeInterface, register } from '../node';

import organization from './organization';

const type = new GraphQLObjectType({
    name: 'Project',
    fields: () => {
        return {
            id: globalIdField('Project'),
            name: { type: GraphQLString },
            organization: { type: organization.type },
        };
    },
    interfaces: [nodeInterface],
});

const {
    connectionType: connection,
    // edgeType: edge,
} = connectionDefinitions({ name: 'Project', nodeType: type });

register(type, (id, { viewer }) => {
    return model.findById(id).exec();
});

export default {
    connection,
    model,
    type,
};
