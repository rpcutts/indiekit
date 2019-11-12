const pkg = require(process.env.PWD + '/package');

const server = require('./../config/server');

// Default application settings
module.exports = (async () => {
  const {client} = server;
  const userConfig = await client.hgetall('app');

  return {
    name: 'IndieKit',
    version: pkg.version,
    description: pkg.description,
    repository: pkg.repository,
    locale: userConfig.locale || 'en',
    publisherId: userConfig.publisherId || 'github',
    themeColor: userConfig.themeColor || '#0000ee'
  };
})();
