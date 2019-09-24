const getCategories = require('./lib/get-categories');
const getPostTypes = require('./lib/get-post-types');
const getPostTypeTemplate = require('./lib/get-post-type-template');
const resolveConfig = require('./lib/resolve-config');

module.exports = class {
  constructor(opts) {
    this.opts = opts;
  }

  /**
   * Get publication configuration.
   *
   * @funtion getConfig
   * @returns {Object} Configuration object
   */
  async getConfig() {
    const resolvedConfig = await resolveConfig(this.opts);

    return {
      'post-types': resolvedConfig['post-types'],
      publisher: this.opts.publisher,
      'slug-separator': resolvedConfig['slug-separator'],
      url: this.opts.url
    };
  }

  /**
   * Get publication configuration values that can be queried.
   *
   * @funtion queryConfig
   * @returns {Object} Configuration object
   */
  async queryConfig() {
    const resolvedConfig = await resolveConfig(this.opts);
    const resolvedMediaEndpoint = this.opts.endpointUrl ?
      `${this.opts.endpointUrl}/media` :
      false;

    return {
      categories: await getCategories(resolvedConfig.categories),
      'media-endpoint': resolvedConfig['media-endpoint'] || resolvedMediaEndpoint,
      'post-types': getPostTypes(resolvedConfig['post-types']),
      'syndicate-to': resolvedConfig['syndicate-to']
    };
  }

  async getPostTypeTemplate(typeConfig) {
    return getPostTypeTemplate(typeConfig);
  }
};
