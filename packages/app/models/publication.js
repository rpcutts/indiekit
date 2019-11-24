const defaults = require('@indiekit/config-jekyll');
const utils = require('@indiekit/support');

const {client, tmpdir} = require('./../config/server');
const publisherConfig = require('./../config/publisher');

// Default application settings
module.exports = (() => {
  const methods = {};

  const getConfig = async publication => {
    let {config, configPath} = await publication;

    // If config has been cached by Redis, parse stored JSON value
    if (config) {
      return JSON.parse(config);
    }

    // Else, fetch config and cache with Redis
    const publisher = await publisherConfig;
    config = await utils.getConfig(configPath, publisher, tmpdir);
    await methods.set('config', JSON.stringify(config));
    return config;
  };

  methods.getAll = async () => {
    const publication = await client.hgetall('publication');
    const config = await getConfig(publication);
    const categories = await utils.getCategories(config.categories);
    const postTypes = await utils.getPostTypes(defaults, config);

    return {
      categories,
      configPath: publication.configPath,
      me: publication.me,
      locale: publication.locale || 'en',
      'post-types': postTypes,
      'slug-separator': config['slug-separator'] || defaults['slug-separator'],
      'syndicate-to': config['syndicate-to'] || defaults['syndicate-to'],
      timezone: publication.timezone || 'utc'
    };
  };

  methods.get = async key => {
    const publication = await methods.getAll();
    return publication[key];
  };

  methods.setAll = values => {
    client.hmset('publication', values);
  };

  methods.set = (key, value) => {
    client.hset('publication', key, value);
  };

  return methods;
})();
