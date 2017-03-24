import {
    GraphQLID,
    GraphQLNonNull,
    GraphQLString,
 } from 'graphql';
import { describe, it } from 'mocha';
import chai from 'chai';

import organization from './organization';
import project from './project';

const expect = chai.expect;

describe('Project', () => {
    it('should have an id', () => {
        expect(project.type.getFields()).to.have.property('id');
        expect(project.type.getFields().id.type).to.deep.equals(new GraphQLNonNull(GraphQLID));
    });
    it('should have a name', () => {
        expect(project.type.getFields()).to.have.property('name');
        expect(project.type.getFields().name.type).to.deep.equals(GraphQLString);
    });
    it('should have an organization', () => {
        expect(project.type.getFields()).to.have.property('organization');
        expect(project.type.getFields().organization.type).to.deep.equals(organization.type);
    });
});
