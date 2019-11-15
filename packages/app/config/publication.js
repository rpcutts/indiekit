const Publication = require('@indiekit/publication');

const publisher = require('./../config/publisher');
const server = require('./../config/server');

const model = require('./../models/publication');

module.exports = async () => {
  const userConfig = await model.getAll();
  const publication = new Publication({
    configPath: userConfig.configPath,
    defaults: require('@indiekit/config-jekyll'),
    me: userConfig.me,
    publisher: await publisher,
    tmpdir: server.tmpdir
  });

  const pub = await publication;
  return pub.getConfig();
};
