import { GraphQLString } from 'graphql';
import { describe, it } from 'mocha';
import chai from 'chai';

import error from './error';

const expect = chai.expect;

describe('Error', () => {
    it('should have a key', () => {
        expect(error.type.getFields()).to.have.property('key');
        expect(error.type.getFields().key.type).to.deep.equals(GraphQLString);
    });
    it('should have a msg', () => {
        expect(error.type.getFields()).to.have.property('msg');
        expect(error.type.getFields().msg.type).to.deep.equals(GraphQLString);
    });
});
