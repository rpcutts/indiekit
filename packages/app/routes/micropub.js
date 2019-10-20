const debug = require('debug')('indiekit:app');
const express = require('express');
const micropub = require('@indiekit/micropub').middleware;
const Publication = require('@indiekit/publication');
const Publisher = require('@indiekit/publisher-github');

const config = require('./../config');

const router = new express.Router();

// Configure publication
const publication = (async () => {
  const {client} = config;
  const pub = await client.hgetall('pub');
  const github = await client.hgetall('github');

  return new Publication({
    configPath: pub.configPath,
    defaults: require('@indiekit/config-jekyll'),
    publisher: new Publisher(github),
    url: pub.me
  });
})();

// Get publication configuration
const pubConfig = (async () => {
  const pub = await publication;
  const config = await pub.getConfig();
  return config;
})();

// Micropub endpoint
router.use('/', micropub.post({
  me: pubConfig.me
}));

// Micropub media endpoint
router.use('/media', micropub.media({
  me: pubConfig.me
}));

module.exports = router;
