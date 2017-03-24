import {
    GraphQLFloat,
    GraphQLID,
    GraphQLNonNull,
    GraphQLString,
} from 'graphql';
import GraphQLDate from 'graphql-custom-datetype';
import { describe, it } from 'mocha';
import chai from 'chai';

import hours from './hours';
import project from './project';
import user from './user';

const expect = chai.expect;

describe('Hours', () => {
    it('should have an id', () => {
        expect(hours.type.getFields()).to.have.property('id');
        expect(hours.type.getFields().id.type).to.deep.equals(new GraphQLNonNull(GraphQLID));
    });
    it('should have a user', () => {
        expect(hours.type.getFields()).to.have.property('comment');
        expect(hours.type.getFields().user.type).to.deep.equals(user.type);
    });
    it('should have a project', () => {
        expect(hours.type.getFields()).to.have.property('project');
        expect(hours.type.getFields().project.type).to.deep.equals(project.type);
    });
    it('should have a date', () => {
        expect(hours.type.getFields()).to.have.property('date');
        expect(hours.type.getFields().date.type).to.deep.equals(GraphQLDate);
    });
    it('should have a start', () => {
        expect(hours.type.getFields()).to.have.property('start');
        expect(hours.type.getFields().start.type).to.deep.equals(GraphQLDate);
    });
    it('should have a end', () => {
        expect(hours.type.getFields()).to.have.property('end');
        expect(hours.type.getFields().end.type).to.deep.equals(GraphQLDate);
    });
    it('should have a duration', () => {
        expect(hours.type.getFields()).to.have.property('duration');
        expect(hours.type.getFields().duration.type).to.deep.equals(GraphQLFloat);
    });
    it('should have a comment', () => {
        expect(hours.type.getFields()).to.have.property('comment');
        expect(hours.type.getFields().comment.type).to.deep.equals(GraphQLString);
    });
});
