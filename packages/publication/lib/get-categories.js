const fetch = require('node-fetch');

/**
 * Returns an array of available categories.
 *
 * @exports getCategories
 * @param {Object} pubCategories Publication category configuration
 * @returns {Promise|Array} Array of categories
 */
module.exports = async pubCategories => {
  let categories = [];

  if (pubCategories && pubCategories.url) {
    const response = await fetch(pubCategories.url, {
      method: 'get',
      headers: {
        Accept: 'application/json'
      }
    }).catch(error => {
      throw new Error(error);
    });

    categories = await response.json();
  } else if (pubCategories && pubCategories.constructor === Array) {
    categories = pubCategories;
  }

  return categories;
};
