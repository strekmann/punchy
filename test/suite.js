/* eslint "import/no-extraneous-dependencies": 0 */

import Promise from 'bluebird';
import mongoose from 'mongoose';
import {
    after,
    before,
} from 'mocha';

mongoose.Promise = Promise;

before((done) => {
    if (!mongoose.connection.db) {
        mongoose.connect('mongodb://localhost/test', () => {
            mongoose.connection.dropDatabase(() => {
                done();
            });
        });
    }
});

after((done) => {
    mongoose.disconnect(() => {
        done();
    });
});
