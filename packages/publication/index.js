const getCategories = require('./lib/get-categories');
const getPostTypes = require('./lib/get-post-types');
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
    const resolvedMediaEndpoint = this.opts.endpointUrl ?
      `${this.opts.endpointUrl}/media` :
      false;

    return {
      categories: await getCategories(resolvedConfig.categories),
      'post-type-config': resolvedConfig['post-types'],
      'post-types': getPostTypes(resolvedConfig['post-types']),
      publisher: this.opts.publisher,
      'media-endpoint': resolvedConfig['media-endpoint'] || resolvedMediaEndpoint,
      'slug-separator': resolvedConfig['slug-separator'],
      'syndicate-to': resolvedConfig['syndicate-to'],
      me: this.opts.me
    };
  }
};
