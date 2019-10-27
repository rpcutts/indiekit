const express = require('express');
const micropub = require('@indiekit/micropub');
const Publication = require('@indiekit/publication');

const config = require('./../config');

const router = new express.Router();

// Configure publication
const publication = (async () => {
  const {client} = config;
  const app = await client.hgetall('app');
  const pub = await client.hgetall('pub');

  // Detirmine publisher
  const publisherId = app.publisherId || 'github';
  const Publisher = require(`@indiekit/publisher-${publisherId}`);
  const publisherConfig = await client.hgetall(publisherId);

  return new Publication({
    configPath: pub.configPath,
    defaults: require('@indiekit/config-jekyll'),
    publisher: new Publisher(publisherConfig),
    tmpdir: config.tmpdir,
    me: pub.me
  });
})();

// Get publication configuration
(async () => {
  const pub = await publication;

  // Micropub endpoint
  router.use('/micropub', micropub({
    config: await pub.getConfig(),
    store: {}
  }));
})();

module.exports = router;
