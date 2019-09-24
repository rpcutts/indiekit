const camelcaseKeys = require('camelcase-keys');
const {utils} = require('@indiekit/support');

/**
 * Undeletes a post.
 *
 * @exports undelete
 * @param {Object} req Request
 * @param {Object} postData Stored post data object
 * @returns {String} Location of undeleted post
*/

module.exports = async (req, postData) => {
  try {
    // Publication
    const {pub} = req.app.locals;
    const pubConfig = pub ? await pub.getConfig() : false;

    if (!pubConfig) {
      throw new Error('Publication config not found');
    }

    // Post type
    const {type} = postData;
    const typeConfig = pubConfig['post-types'][type];
    const typeTemplate = await pub.getPostTypeTemplate(typeConfig);

    // Get properties
    const {properties} = postData.mf2;

    // Get publish path
    let {path} = postData;
    path = utils.normalizePath(path);

    // Render content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));

    // Undelete post file
    const {publisher} = pubConfig;
    const message = `${typeConfig.icon} Undeleted ${type} post`;
    const response = await publisher.createFile(path, content, message);

    // Return post data
    if (response) {
      return postData;
    }
  } catch (error) {
    throw new Error(error);
  }
};
