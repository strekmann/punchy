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
    // GraphQLID,
    // GraphQLInputObjectType,
    // GraphQLInt,
    // GraphQLList,
    // GraphQLNonNull,
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
    // mutationWithClientMutationId,
    nodeDefinitions,
    connectionArgs,
    connectionDefinitions,
} from 'graphql-relay';

import config from 'config';

import {
    connectionFromMongooseQuery,
    // offsetToCursor,
} from './connections/mongoose';

// Import models
// import User from '../models/user';
import Project from '../models/project';
import Organization from '../models/organization';

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId, { viewer }) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            if (viewer && viewer.id === id) { return viewer; }
            return null;
        }
        if (type === 'Project') {
            // TODO: add rights check
            return Project.findById(id);
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

// const mutationCreateLink = mutationWithClientMutationId({
//     name: 'CreateLink',
//     inputFields: {
//         url: { type: new GraphQLNonNull(GraphQLString) },
//         shortid: { type: new GraphQLNonNull(GraphQLString) },
//     },
//     outputFields: {
//         newLinkEdge: {
//             type: LinkEdge,
//             resolve: ({link}, args, context) => {
//                 return {
//                     cursor: offsetToCursor(0),
//                     node: link,
//                 };
//             },
//         },
//         viewer: {
//             type: userType,
//             resolve: (payload, args, {viewer}) => viewer,
//         },
//         errors: {
//             type: new GraphQLList(errorType),
//             resolve: ({errors}) => errors,
//         },
//     },
//     mutateAndGetPayload: ({url, shortid}, {viewer}) => {
//         url = url.trim();
//         shortid = shortid.trim();
//
//         let e = [];
//         e = e.concat(validateUrl(url, 'url'));
//         e = e.concat(validateShortid(shortid, 'shortid'));
//
//         // check if shortid is taken
//         return Link.findById(shortid).populate('user', 'name affiliation').exec()
//         .then((link) => {
//             if (link) {
//                 const user = link.user.affiliation !== 'employee' ? 'a student' : link.user.name;
//                 const expires = moment().to(moment(link.created).add(1, 'year'));
//                 e.push({key: 'shortid', msg: `ID taken by ${user}. Expires ${expires}`});
//             }
//             if (e.length > 0) {
//                 return {link: null, errors: e};
//             }
//
//             link = new Link({
//                 url,
//                 _id: shortid,
//                 user: viewer.id,
//             });
//             return {link: link.save(), errors: []};
//         });
//     },
// });


/** MUTATION TYPE **/
const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => {
        return {
            // createLink: mutationCreateLink,
        };
    },
});

const schema = new GraphQLSchema({
    query: queryType,
    // mutation: mutationType,
});

export default schema;
