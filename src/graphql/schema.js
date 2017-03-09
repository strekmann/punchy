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
    GraphQLBoolean,
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
import GraphQLDate from 'graphql-custom-datetype';

// Import relay stuff
import {
    fromGlobalId,
    // toGlobalId,
    globalIdField,
    mutationWithClientMutationId,
    nodeDefinitions,
    connectionArgs,
    connectionDefinitions,
} from 'graphql-relay';

import config from 'config';

import {
    connectionFromMongooseQuery,
    offsetToCursor,
} from './connections/mongoose';

// Import models
// import User from '../models/user';
import Project from '../models/project';
import Organization from '../models/organization';
import Hours from '../models/hours';

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId, { viewer }) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            if (viewer && viewer.id === id) { return viewer; }
            return null;
        }
        if (type === 'Project') {
            return Organization.find({ users: viewer.id }).exec()
            .then((organizations) => {
                return Project.findById(id).where('organization').in(organizations.map((org) => {
                    return org._id;
                }));
            });
        }
        return null;
    },
    (obj) => {
        if (obj.$type === 'User') {
            return userType;
        }
        if (obj.$type === 'Project') {
            return projectType;
        }
        return null;
    },
);

/** TYPES **/
const projectType = new GraphQLObjectType({
    name: 'Project',
    fields: () => {
        return {
            id: globalIdField('Project'),
            name: { type: GraphQLString },
            organization: { type: organizationType },
        };
    },
    interfaces: [nodeInterface],
});

const organizationType = new GraphQLObjectType({
    name: 'Organization',
    description: 'The company or organization that a user works for',
    fields: () => {
        return {
            id: globalIdField('Organization'),
            name: { type: GraphQLString },
        };
    },
});

const hoursType = new GraphQLObjectType({
    name: 'Hours',
    description: 'Hours is the registration object saved to the database. Silly name, I know.',
    fields: () => {
        return {
            id: globalIdField('Hours'),
            user: {
                type: userType,
            },
            project: {
                type: projectType,
            },
            date: { type: GraphQLDate },
            start: { type: GraphQLDate },
            end: { type: GraphQLDate },
            duration: { type: GraphQLFloat },
            comment: { type: GraphQLString },
        };
    },
});

const userType = new GraphQLObjectType({
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
                type: hoursConnection,
                args: connectionArgs,
                resolve: (_, args, { viewer }) => {
                    return connectionFromMongooseQuery(
                        Hours.find({ user: viewer.id }).sort('-created'),
                        args,
                    );
                },
            },
        };
    },
    interfaces: [nodeInterface],
});

const errorType = new GraphQLObjectType({
    name: 'ErrorType',
    description: 'Application error',
    fields: () => {
        return {
            key: { type: GraphQLString },
            msg: { type: GraphQLString },
        };
    },
});

const siteType = new GraphQLObjectType({
    name: 'Site',
    description: 'I R Punchy',
    fields: () => {
        return {
            name: {
                type: GraphQLString,
            },
            viewer: {
                type: userType,
                resolve: (_, args, { viewer }) => {
                    return viewer;
                },
            },
            projects: {
                type: projectConnection,
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

/** RELAY CONNECTIONS **/
const {
    connectionType: projectConnection,
    // edgeType: ProjectEdge,
} = connectionDefinitions({ name: 'Project', nodeType: projectType });

const {
    connectionType: hoursConnection,
    edgeType: hoursEdge,
} = connectionDefinitions({ name: 'Hours', nodeType: hoursType });

/** QUERY TYPE **/
const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        site: {
            type: siteType,
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
            type: hoursEdge,
            resolve: ({ hours }) => {
                return {
                    cursor: offsetToCursor(0),
                    node: hours,
                };
            },
        },
        viewer: {
            type: userType,
            resolve: (_, { viewer }) => {
                return viewer;
            },
        },
        errors: {
            type: new GraphQLList(errorType),
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
        }).then((_hours) => {
            return { hours: _hours, errors: [] };
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
