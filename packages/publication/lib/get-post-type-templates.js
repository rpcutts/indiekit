const path = require('path');
const utils = require('@indiekit/support');

/**
 * Merge publication’s configured post types (saving any referenced templates)
 * with default values set by application.
 *
 * @exports getPostTypeTemplates
 * @param {Object} configPostTypes Configured post types
 * @param {Object} opts Options
 * @returns {Promise} Post types object
 */
module.exports = async (configPostTypes, opts) => {
  const savedTemplates = [];
  for (const key in configPostTypes) {
    if (typeof configPostTypes[key] === 'object') {
      const configPostType = configPostTypes[key];
      if (configPostType.template && !configPostType.resolved) {
        // Fetch template and save locally
        savedTemplates.push(
          utils.getData(configPostType.template, opts.tmpdir, opts.publisher)
        );

        // Update `template` with path to saved file
        configPostType.template = path.join(opts.tmpdir, configPostType.template);

        // Flag as resolved
        configPostType.resolved = true;
      }
    }
  }

  // Wait for all template files to be saved
  await Promise.all(savedTemplates);

  // Update post types config
  if (savedTemplates) {
    return configPostTypes;
  }
};
