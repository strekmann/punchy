/* eslint no-use-before-define: 0 */

// import moment from 'moment';

// User -- Hours
// User -- Organization
// Hours -- Project
// Organization -- Project
// Project -- client
// Project -- Invoice (Attachment)

// Root er site: alt ligger under den

// Import graphql stuff
import {
    GraphQLID,
    // GraphQLInputObjectType,
    // GraphQLInt,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from 'graphql';
// Import relay stuff
import {
    fromGlobalId,
    // toGlobalId,
    mutationWithClientMutationId,
} from 'graphql-relay';
import config from 'config';

// Import models
// import User from '../models/user';
import Hours from '../models/hours';

import error from './types/error';
import hours from './types/hours';
import site from './types/site';
import user from './types/user';
import { offsetToCursor } from './connections/mongoose';
import { nodeField } from './node';

/** QUERY TYPE **/
const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        site: {
            type: site.type,
            resolve: () => {
                return {
                    name: config.get('graphql.name'),
                };
            },
        },
    },
});

/* TODO: Check why GraphQLDate does not work in mutations */
const mutationCreateHours = mutationWithClientMutationId({
    name: 'CreateHours',
    inputFields: {
        projectId: { type: new GraphQLNonNull(GraphQLID) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        start: { type: GraphQLString },
        end: { type: GraphQLString },
        duration: { type: GraphQLFloat },
        comment: { type: GraphQLString },
    },
    outputFields: {
        newHoursEdge: {
            type: hours.edge,
            resolve: ({ hours }) => {
                return {
                    cursor: offsetToCursor(0),
                    node: hours,
                };
            },
        },
        viewer: {
            type: user.type,
            resolve: (_, { viewer }) => {
                return viewer;
            },
        },
        errors: {
            type: new GraphQLList(error.type),
            resolve: ({ errors }) => {
                return errors;
            },
        },
    },
    mutateAndGetPayload: (hours, { viewer }) => {
        const pId = fromGlobalId(hours.projectId).id;
        // TODO: Validation
        return Hours.create({
            project: pId,
            user: viewer.id,
            date: hours.date,
            start: hours.start,
            end: hours.end,
            duration: hours.duration,
            comment: hours.comment,
        }).then((hours) => {
            return { hours, errors: [] };
        });
    },
});

/** MUTATION TYPE **/
const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => {
        return {
            createHours: mutationCreateHours,
        };
    },
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});

export default schema;
