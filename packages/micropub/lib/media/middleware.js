const express = require('express');
const multer = require('multer');
const IndieAuth = require('@indiekit/indieauth');

const queryEndpoint = require('./query-endpoint');
const uploadMedia = require('./upload-media');

/**
 * Express middleware function for Micropub media endpoint.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
  const {config} = opts;

  // Create new Express router
  const media = new express.Router({
    caseSensitive: true,
    mergeParams: true
  });

  // Parse multipart/form-data requests
  const multipartParser = multer({
    storage: multer.memoryStorage()
  });

  // Parse application/x-www-form-urlencoded requests
  const urlencodedParser = express.urlencoded({
    extended: true,
    limit: '10mb'
  });

  // Configure IndieAuth middleware
  const indieauth = new IndieAuth({
    me: config.me
  });

  media.get('/',
    urlencodedParser,
    (req, res, next) => {
      const {media} = req.session;

      try {
        const response = queryEndpoint(req, media);
        return res.json(response);
      } catch (error) {
        return next(error);
      }
    }
  );

  media.post('/',
    indieauth.authorize,
    multipartParser.single('file'),
    async (req, res, next) => {
      const {file} = req;
      const {media} = req.session;

      const authorized = indieauth.checkScope('create').catch(error => {
        return next(error);
      });

      const uploaded = await uploadMedia(req, file, media, config).catch(error => {
        return next(error);
      });

      if (authorized && uploaded) {
        res.header('Location', uploaded.url);
        return res.status(201).json({
          success: 'create',
          success_description: `Media saved to ${uploaded.url}`
        });
      }
    }
  );

  return media;
};
