const application = require('./../config/application');
const server = require('./../config/server');

module.exports = (async () => {
  const {client} = server;
  const {publisherId} = await application;
  const Publisher = require(`@indiekit/publisher-${publisherId}`);
  const userConfig = await client.hgetall(publisherId);

  return new Publisher(userConfig);
})();
