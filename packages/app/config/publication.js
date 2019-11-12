const Publication = require('@indiekit/publication');

const publisher = require('./../config/publisher');
const server = require('./../config/server');

module.exports = (async () => {
  const {client} = server;
  const userConfig = await client.hgetall('pub');

  return new Publication({
    configPath: userConfig.configPath,
    defaults: require('@indiekit/config-jekyll'),
    me: userConfig.me,
    publisher: await publisher,
    tmpdir: server.tmpdir
  });
})();