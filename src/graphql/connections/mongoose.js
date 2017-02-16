import { base64, unbase64 } from '../utils';

const PREFIX = 'connection:';

export function offsetToCursor(offset) {
    return base64(PREFIX + offset);
}

function cursorToOffset(cursor) {
    return parseInt(unbase64(cursor).substring(PREFIX.length), 10);
}

function getOffsetWithDefault(cursor, defaultOffset) {
    if (cursor === undefined) {
        return defaultOffset;
    }
    const offset = cursorToOffset(cursor);
    return isNaN(offset) ? defaultOffset : offset;
}

function getOffsetsFromArgs(inArgs, count) {
    const args = inArgs || {};
    const after = args.after;
    const before = args.before;
    const first = args.first;
    const last = args.last;

    const beforeOffset = getOffsetWithDefault(before, count);
    const afterOffset = getOffsetWithDefault(after, -1);

    let startOffset = Math.max(-1, afterOffset) + 1;
    let endOffset = Math.min(count, beforeOffset);

    if (first !== undefined) {
        endOffset = Math.min(endOffset, startOffset + first);
    }
    if (last !== undefined) {
        startOffset = Math.max(startOffset, endOffset - last);
    }

    const skip = Math.max(startOffset, 0);
    const limit = endOffset - startOffset;

    return {
        beforeOffset,
        afterOffset,
        startOffset,
        endOffset,
        skip,
        limit,
    };
}

function getConnectionFromSlice(inSlice, mapper, args, count) {
    const first = args.first;
    const last = args.last;
    const before = args.before;
    const after = args.after;

    const offsetsFromArgs = getOffsetsFromArgs(args, count);
    const startOffset = offsetsFromArgs.startOffset;
    const endOffset = offsetsFromArgs.endOffset;
    const beforeOffset = offsetsFromArgs.beforeOffset;
    const afterOffset = offsetsFromArgs.afterOffset;

    // If we have a mapper function, map it!
    const slice = typeof mapper === 'function' ? inSlice.map(mapper) : inSlice;

    const edges = slice.map((value, index) => {
        return {
            cursor: offsetToCursor(startOffset + index),
            node: value,
        };
    });

    const firstEdge = edges[0];
    const lastEdge = edges[edges.length - 1];
    const lowerBound = after ? afterOffset + 1 : 0;
    const upperBound = before ? Math.min(beforeOffset, count) : count;

    return {
        edges,
        pageInfo: {
            startCursor: firstEdge ? firstEdge.cursor : null,
            endCursor: lastEdge ? lastEdge.cursor : null,
            hasPreviousPage: last !== null ? startOffset > lowerBound : false,
            hasNextPage: first !== null ? endOffset < upperBound : false,
        },
    };
}

export function connectionFromMongooseQuery(query, inArgs, mapper) {
    const args = inArgs || {};

    return query.count()
    .then((count) => {
        const pagination = getOffsetsFromArgs(args, count);

        if (pagination.limit === 0) {
            return getConnectionFromSlice([], mapper, args, count);
        }

        query.skip(pagination.skip);
        query.limit(pagination.limit);

        return query.find().then((slice) => {
            return getConnectionFromSlice(slice, mapper, args, count);
        });
    });
}