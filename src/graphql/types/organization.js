import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';
import { globalIdField } from 'graphql-relay';

import model from '../../models/organization';

const type = new GraphQLObjectType({
    name: 'Organization',
    description: 'The company or organization that a user works for',
    fields: () => {
        return {
            id: globalIdField('Organization'),
            name: { type: GraphQLString },
        };
    },
});

export default {
    model,
    type,
};
