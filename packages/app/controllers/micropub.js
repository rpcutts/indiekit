const express = require('express');
const micropub = require('@indiekit/micropub');

const cache = require('./../config/cache');
const publication = require('./../models/publication');
const publisher = require('./../config/publisher');

const router = new express.Router();

(async () => {
  router.use('/', micropub({
    config: await publication.getAll(),
    mediaStore: cache('media'),
    postStore: cache('post'),
    publisher
  }));
})();

module.exports = router;
