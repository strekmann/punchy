var _ = require('underscore');

/*
 * modelObjects: Array of objects to populate
 * newFieldName: Name of the new field
 * fillArray: If this function returns multiple objects to be treated in array
 * relatedModel: Name of the related Mongoose model
 * idField: Name of the field containing the id
 * callback: The function to run when this is all done
 */

var populateResult = function (newFieldName, fillArray, match, result) {
    if (fillArray) {
        match[newFieldName] = match[newFieldName] || [];
        match[newFieldName].push(result);
    }
    else {
        match[newFieldName] = result;
    }
};

var populateRelated = function (modelObjects, newFieldName, fillArray, relatedModel, idField, callback) {

    if (!modelObjects.length) {
        return callback(null, modelObjects);
    }

    var modelIndex = _.indexBy(modelObjects, '_id');

    var populatedResults = populateResult.bind(this, newFieldName, fillArray);

    var ids = _.map(modelObjects, function (model) {
        return model._id;
    });

    var query = {};

    query[idField] = {$in: ids};

    relatedModel.find(query).exec(function (err, results) {
        if (err) {
            return callback(err);
        }
        _.each(results, function (result) {
            if (_.isArray(result)) {
                _.each(result[idField], function (resultId) {
                    var match = modelIndex[resultId];
                    if (match) {
                        populatedResults(match, result);
                    }
                });
            }
            else {
                var match = modelIndex[result[idField]];
                if (match) {
                    populatedResults(match, result);
                }
            }
        });
        callback(null, modelObjects);
    });
};

module.exports = populateRelated;
