const express = require('express');
const micropub = require('@indiekit/micropub');

const cache = require('./../config/cache');
const publication = require('./../config/publication');
const publisher = require('./../config/publisher');

const router = new express.Router();

// Get publication configuration
(async () => {
  const pub = await publication;

  // Micropub endpoint
  router.use('/micropub', micropub({
    config: await pub.getConfig(),
    mediaStore: cache('media'),
    postStore: cache('post'),
    publisher: await publisher
  }));
})();

module.exports = router;
