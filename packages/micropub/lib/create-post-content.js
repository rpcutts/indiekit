const fs = require('fs');
const camelcaseKeys = require('camelcase-keys');
const utils = require('@indiekit/support');

/**
 * Creates a post content file.
 *
 * @exports createPostContent
 * @param {Object} postData Post data
 * @param {Object} pub Publication settings
 * @returns {String} Rendered content
 */
module.exports = async (postData, pub) => {
  try {
    // Post type
    const {type} = postData;
    const typeConfig = pub['post-type-config'][type];
    const typeTemplateFile = await fs.promises.readFile(typeConfig.template);
    const typeTemplate = Buffer.from(typeTemplateFile).toString('utf-8');

    // Derive properties
    const {properties} = postData;

    // Return content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));
    return content;
  } catch (error) {
    throw new Error(error);
  }
};
