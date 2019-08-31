const express = require('express');
const multer = require('multer');
const indieauth = require('@indiekit/indieauth').middleware;

const queryEndpoint = require('./query-endpoint');
const uploadMedia = require('./upload-media');

/**
 * Express middleware function for Micropub media endpoint.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
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
    indieauth.authorize(opts.me),
    indieauth.checkScope('create'),
    multipartParser.single('file'),
    async (req, res, next) => {
      const {file} = req;
      const {media} = req.session;

      const uploaded = await uploadMedia(req, file, media).catch(error => {
        return next(error);
      });

      if (uploaded) {
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
