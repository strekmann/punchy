import {
    fromGlobalId,
    nodeDefinitions,
} from 'graphql-relay';

const TYPE_REGISTRY = {};

export function register(type, resolveById) {
    TYPE_REGISTRY[type.name] = {
        type,
        resolveById,
    };
    return type;
}

export const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId, context) => {
        const { type, id } = fromGlobalId(globalId);
        return TYPE_REGISTRY[type] ? TYPE_REGISTRY[type].resolveById(id, context) : null;
    },
    (obj) => {
        return TYPE_REGISTRY[obj.$type] ? TYPE_REGISTRY[obj.type].type : null;
    },
);
