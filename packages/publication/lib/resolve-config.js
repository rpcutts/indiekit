const _ = require('lodash');
const debug = require('debug')('indiekit:publication:resolveConfig');
const getPostTypeTemplates = require('./get-post-type-templates');

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
    configPostTypes = getPostTypeTemplates(configPostTypes, opts);

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
  const {configPath, defaults, publisher} = opts;

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
    // Merge publisher and default configs
    const resolvedConfig = _.merge(defaults, config);

    // Merge publisher and default post types
    const resolvedPostTypes = await resolvePostTypes(opts, config['post-types'], defaults['post-types']).catch(error => {
      throw new Error(error.message);
    });
    resolvedConfig['post-types'] = resolvedPostTypes;

    return resolvedConfig;
  } catch (error) {
    throw new Error(error.message);
  }
};
