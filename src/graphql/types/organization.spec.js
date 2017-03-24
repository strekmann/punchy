import {
    GraphQLID,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql';
import { describe, it } from 'mocha';
import chai from 'chai';

import organization from './organization';

const expect = chai.expect;

describe('Organization', () => {
    it('should have an id', () => {
        expect(organization.type.getFields()).to.have.property('id');
        expect(organization.type.getFields().id.type).to.deep.equals(new GraphQLNonNull(GraphQLID));
    });
    it('should have a name', () => {
        expect(organization.type.getFields()).to.have.property('name');
        expect(organization.type.getFields().name.type).to.deep.equals(GraphQLString);
    });
});
