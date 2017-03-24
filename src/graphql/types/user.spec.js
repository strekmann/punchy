import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql';
import GraphQLDate from 'graphql-custom-datetype';
import { describe, it } from 'mocha';
import chai from 'chai';

import hours from './hours';
import user from './user';

const expect = chai.expect;

describe('User', () => {
    it('should have an id', () => {
        expect(user.type.getFields()).to.have.property('id');
        expect(user.type.getFields().id.type).to.deep.equals(new GraphQLNonNull(GraphQLID));
    });
    it('should have a username', () => {
        expect(user.type.getFields()).to.have.property('username');
        expect(user.type.getFields().username.type).to.deep.equals(GraphQLString);
    });
    it('should have a created date', () => {
        expect(user.type.getFields()).to.have.property('created');
        expect(user.type.getFields().created.type).to.deep.equals(GraphQLDate);
    });
    it('should have isAdmin', () => {
        expect(user.type.getFields()).to.have.property('isAdmin');
        expect(user.type.getFields().isAdmin.type).to.deep.equals(GraphQLBoolean);
    });
    it('should have hours', () => {
        expect(user.type.getFields()).to.have.property('hours');
        expect(user.type.getFields().hours.type).to.deep.equals(hours.connection);
    });
});
