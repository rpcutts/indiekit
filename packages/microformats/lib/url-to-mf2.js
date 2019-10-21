const axios = require('axios');
const htmlToMf2 = require('./html-to-mf2');

/**
 * Parses microformats at a given URL.
 *
 * @exports urlToMf2
 * @param {String} url URL path to post
 * @param {String} properties mf2 properties to return
 * @returns {Promise} mf2 object
 */
module.exports = async (url, properties) => {
  try {
    const response = await axios.get(url);
    return htmlToMf2(response.data, properties);
  } catch (error) {
    throw new Error(error.message);
  }
};
