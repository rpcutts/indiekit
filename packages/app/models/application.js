const pkg = require(process.env.PWD + '/package');

const {client} = require('./../config/server');

// Default application settings
module.exports = (() => {
  const methods = {};

  methods.getAll = async () => {
    const application = await client.hgetall('application');
    return {
      name: 'IndieKit',
      version: pkg.version,
      description: pkg.description,
      repository: pkg.repository,
      configured: application.configured,
      locale: application.locale || 'en',
      publisherId: application.publisherId || 'github',
      themeColor: application.themeColor || '#0000ee'
    };
  };

  methods.get = async key => {
    const application = await methods.getAll();
    return application[key];
  };

  methods.setAll = values => {
    client.hmset('application', values);
  };

  methods.set = (key, value) => {
    client.hset('application', key, value);
  };

  return methods;
})();
