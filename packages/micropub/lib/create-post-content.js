const fs = require('fs');
const camelcaseKeys = require('camelcase-keys');
const utils = require('@indiekit/support');

/**
 * Create post content by populating post template with post data.
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
    const {properties} = postData.mf2;

    // Return content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));
    return content;
  } catch (error) {
    throw new Error(error);
  }
};
