const fs = require('fs');
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

    // Post type
    const {type} = postData;
    const typeConfig = pub['post-type-config'][type];
    const typeTemplateFile = fs.readFileSync(typeConfig.template);
    const typeTemplate = Buffer.from(typeTemplateFile).toString('utf-8');

    // Get properties
    const {properties} = postData.mf2;

    // Get publish path
    const {path} = postData;

    // Render content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));

    // Undelete post file
    const {publisher} = pub;
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
