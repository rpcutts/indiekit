const camelcaseKeys = require('camelcase-keys');
const publication = require('@indiekit/publication');
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
    const {pub} = req.app.locals;
    const {publisher} = pub;

    // Get type
    const {type} = postData;

    // Get properties
    const {properties} = postData.mf2;

    // Get type config
    const typeConfig = pub['post-types'][type];

    // Get template
    const template = await publication.getPostTypeTemplate(typeConfig);

    // Get publish path
    let {path} = postData;
    path = utils.normalizePath(path);

    // Render content
    const content = utils.render(template, camelcaseKeys(properties));

    // Compose commit message
    const message = `${typeConfig.icon} Undeleted ${type} post`;

    // Undelete post file
    const response = await publisher.createFile(path, content, message);
    if (response) {
      return postData;
    }
  } catch (error) {
    throw new Error(error);
  }
};
