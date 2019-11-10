const _ = require('lodash');
const utils = require('@indiekit/support');
const deriveProperty = require('./../utils/derive-property');

/**
 * Add properties to object.
 *
 * @private
 * @function addProperties
 * @param {Object} obj Object to update
 * @param {Object} additions Properties to add
 * @return {Object} Updated object
 */
function addProperties(obj, additions) {
  for (const key in additions) {
    if (Object.prototype.hasOwnProperty.call(additions, key)) {
      const newValue = additions[key];
      const existingValue = obj[key];

      // If no existing value, add it
      if (!existingValue) {
        obj[key] = newValue;
        return obj;
      }

      // If existing value, add to it
      if (existingValue) {
        const updatedValue = [...existingValue];

        for (const value of newValue) {
          updatedValue.push(value);
        }

        obj = _.set(obj, key, updatedValue);
        return obj;
      }
    }
  }
}

/**
 * Delete individual entries for properties of an object.
 *
 * @private
 * @function deleteEntries
 * @param {Object} obj Object to update
 * @param {Object} deletions Property entries to delete
 * @return {Object} Updated object
 */
function deleteEntries(obj, deletions) {
  for (const key in deletions) {
    if (Object.prototype.hasOwnProperty.call(deletions, key)) {
      const valuesToDelete = deletions[key];

      if (!Array.isArray(valuesToDelete)) {
        throw new TypeError(`${key} should be an array`);
      }

      const values = obj[key];
      if (!valuesToDelete || !values) {
        return obj;
      }

      for (const value of valuesToDelete) {
        const index = values.indexOf(value);
        if (index > -1) {
          values.splice(index, 1);
        }

        if (values.length === 0) {
          delete obj[key]; // Delete property if no values remain
        } else {
          obj[key] = values;
        }
      }
    }
  }

  return obj;
}

/**
 * Delete properties of an object.
 *
 * @private
 * @function deleteProperties
 * @param {Object} obj Object to update
 * @param {Array} deletions Properties to delete
 * @return {Object} Updated object
 */
function deleteProperties(obj, deletions) {
  for (const key of deletions) {
    delete obj[key];
  }

  return obj;
}

/**
 * Replace entries of a property. If property doesn’t exist, create it.
 *
 * @private
 * @function replaceEntries
 * @param {Object} obj Object to update
 * @param {Object} replacements Properties to replace
 * @return {Object} Updated object
 */
function replaceEntries(obj, replacements) {
  for (const key in replacements) {
    if (Object.prototype.hasOwnProperty.call(replacements, key)) {
      const value = replacements[key];
      obj = _.set(obj, key, value);
    }
  }

  return obj;
}

/**
 * Updates a post.
 *
 * @exports updateData
 * @param {Object} req Request
 * @param {Object} postData Stored post data object
 * @param {Object} pub Publication settings
 * @returns {String} Location of undeleted post
*/
module.exports = async (req, postData, pub) => {
  try {
    const {body} = req;

    // Post type
    const {type} = postData;
    const typeConfig = pub['post-type-config'][type];

    // Get properties
    let {properties} = postData.mf2;

    // Replace property entries
    if (body.replace) {
      properties = replaceEntries(properties, body.replace);
    }

    // Add properties
    if (body.add) {
      properties = addProperties(properties, body.add);
    }

    // Remove properties and/or property entries
    if (body.delete) {
      if (Array.isArray(body.delete)) {
        properties = deleteProperties(properties, body.delete);
      } else {
        properties = deleteEntries(properties, body.delete);
      }
    }

    // Update publish path and public url
    const path = utils.render(typeConfig.post.path, properties);
    let url = utils.render(typeConfig.post.url, properties);
    url = deriveProperty.permalink(pub.me, url);

    // Return post data
    const updatedData = {
      type,
      path,
      url,
      mf2: {
        type: (type === 'event') ? ['h-event'] : ['h-entry'],
        properties
      }
    };

    return updatedData;
  } catch (error) {
    throw new Error(error.message);
  }
};
