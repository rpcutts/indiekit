const utils = require('@indiekit/support');
const dataFormat = require('./utils/data-format');
const derive = require('./utils/derive');
const update = require('./utils/update');

/**
 * Updates a post.
 *
 * @exports update
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
    if (Object.prototype.hasOwnProperty.call(body, 'replace')) {
      properties = update.replaceEntries(properties, body.replace);
    }

    // Add properties
    if (Object.prototype.hasOwnProperty.call(body, 'add')) {
      properties = update.addProperties(properties, body.add);
    }

    // Remove properties and/or property entries
    if (Object.prototype.hasOwnProperty.call(body, 'delete')) {
      if (Array.isArray(body.delete)) {
        properties = update.deleteProperties(properties, body.delete);
      } else {
        properties = update.deleteEntries(properties, body.delete);
      }
    }

    // Update publish path and public url
    const path = utils.render(typeConfig.post.path, properties);
    let url = utils.render(typeConfig.post.url, properties);
    url = derive.permalink(pub.me, url);

    // Return post data
    const postData = dataFormat.post(type, path, url, properties);
    return postData;
  } catch (error) {
    throw new Error(error);
  }
};
