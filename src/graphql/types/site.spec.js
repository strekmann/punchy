import {
    GraphQLID,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql';
import { describe, it } from 'mocha';
import chai from 'chai';

import project from './project';
import site from './site';
import user from './user';

const expect = chai.expect;

describe('Site', () => {
    it('should not have an id', () => {
        expect(site.type.getFields()).to.not.have.property('id');
    });
    it('should have a name', () => {
        expect(site.type.getFields()).to.have.property('name');
        expect(site.type.getFields().name.type).to.deep.equals(GraphQLString);
    });
    it('should have a viewer', () => {
        expect(site.type.getFields()).to.have.property('viewer');
        expect(site.type.getFields().viewer.type).to.deep.equals(user.type);
    });
    it('should have projects', () => {
        expect(site.type.getFields()).to.have.property('projects');
        expect(site.type.getFields().projects.type).to.deep.equals(project.connection);
    });
});
