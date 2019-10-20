const os = require('os');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('indiekit:publication:resolveConfig');
const utils = require('@indiekit/support');

/**
 * Merge publication’s configured post types (saving any referenced templates)
 * with default values set by application.
 *
 * @private
 * @function resolvePostTypes
 * @param {Object} opts Module options
 * @param {String} configPostTypes Post types configured by publication
 * @param {Object} defaultPostTypes Default post types
 * @returns {Promise} Post types object
 */
async function resolvePostTypes(opts, configPostTypes, defaultPostTypes) {
  try {
    // Error if `post-types` is an array
    if (Array.isArray(configPostTypes)) {
      throw new TypeError('`post-types` should be an object');
    }

    // Cache configured templates
    const savedTemplates = [];
    for (const key in configPostTypes) {
      if (typeof configPostTypes[key] === 'object') {
        const configPostType = configPostTypes[key];
        if (configPostType.template && !configPostType.resolved) {
          // Fetch template and save locally
          savedTemplates.push(
            utils.getData(configPostType.template, opts.publisher)
          );

          // Update `template` with path to saved file
          configPostType.template = path.join(os.tmpdir(), configPostType.template);

          // Flag as resolved
          configPostType.resolved = true;
        }
      }
    }

    // Wait for all template files to be saved
    await Promise.all(savedTemplates);

    // Merge default and publication post types
    const resolvedPostTypes = _.merge(defaultPostTypes, configPostTypes);

    return resolvedPostTypes;
  } catch (error) {
    throw new TypeError(error.message);
  }
}

/**
 * Merge publication’s configuration with default values set by application.
 *
 * @exports resolveConfig
 * @param {Object} opts Module options
 * @returns {Promise} Resolved configuration object
 */
module.exports = async opts => {
  const {defaults} = opts;
  const {configPath} = opts;
  const {publisher} = opts;

  let config;
  if (configPath) {
    // Get remote configuration file (if provided)
    const content = await publisher.readFile(configPath).catch(error => {
      throw new Error(error.message);
    });
    config = JSON.parse(content);
  } else if (opts.config) {
    // Use provided configuration (if provided)
    config = opts.config;
  } else {
    // Return default configuration if no customisation values found
    debug('Configuration not found. Using defaults');

    return defaults;
  }

  try {
    // Merge publisher settings with default config
    const resolvedConfig = _.merge(defaults, config);

    // Merge publisher post types (with saved templates) with default config
    const configPostTypes = config['post-types'];
    if (configPostTypes) {
      const defaultPostTypes = defaults['post-types'];
      const resolvedPostTypes = await resolvePostTypes(opts, configPostTypes, defaultPostTypes).catch(error => {
        throw new Error(error.message);
      });
      resolvedConfig['post-types'] = resolvedPostTypes;
    }

    return resolvedConfig;
  } catch (error) {
    throw new Error(error.message);
  }
};
