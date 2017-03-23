import {
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

const type = new GraphQLObjectType({
    name: 'ErrorType',
    description: 'Application error',
    fields: () => {
        return {
            key: { type: GraphQLString },
            msg: { type: GraphQLString },
        };
    },
});

export default {
    type,
};
