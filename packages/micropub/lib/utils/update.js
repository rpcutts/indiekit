const _ = require('lodash');

/**
 * Add properties to object.
 *
 * @exports addProperties
 * @param {Object} obj Object to update
 * @param {Object} additions Properties to add
 * @return {Object} Updated object
 */
const addProperties = (obj, additions) => {
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
};

/**
 * Delete individual entries for properties of an object.
 *
 * @exports deleteEntries
 * @param {Object} obj Object to update
 * @param {Object} deletions Property entries to delete
 * @return {Object} Updated object
 */
const deleteEntries = (obj, deletions) => {
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
};

/**
 * Delete properties of an object.
 *
 * @exports deleteProperties
 * @param {Object} obj Object to update
 * @param {Array} deletions Properties to delete
 * @return {Object} Updated object
 */
const deleteProperties = (obj, deletions) => {
  for (const key of deletions) {
    delete obj[key];
  }

  return obj;
};

/**
 * Replace entries of a property. If property doesn’t exist, create it.
 *
 * @exports replaceEntries
 * @param {Object} obj Object to update
 * @param {Object} replacements Properties to replace
 * @return {Object} Updated object
 */
const replaceEntries = (obj, replacements) => {
  for (const key in replacements) {
    if (Object.prototype.hasOwnProperty.call(replacements, key)) {
      const value = replacements[key];
      obj = _.set(obj, key, value);
    }
  }

  return obj;
};

module.exports = {
  addProperties,
  deleteEntries,
  deleteProperties,
  replaceEntries
};
