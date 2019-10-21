const axios = require('axios');

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
    try {
      const response = await axios.get(pubCategories.url, {
        headers: {
          Accept: 'application/json'
        }
      });
      categories = response.data;
    } catch (error) {
      throw new Error(error);
    }
  } else if (pubCategories && pubCategories.constructor === Array) {
    categories = pubCategories;
  }

  return categories;
};
