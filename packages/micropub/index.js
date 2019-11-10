const express = require('express');
const multer = require('multer');
const IndieAuth = require('@indiekit/indieauth');

const readPostData = require('./lib/post/read-data');
const queryEndpoint = require('./lib/query-endpoint');
const queryMediaEndpoint = require('./lib/query-media-endpoint');

/**
 * Express middleware function for Micropub endpoint.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
  const {config, postStore, mediaStore} = opts;
  const {publisher} = config;

  const media = require('./lib/media')({
    config,
    mediaStore,
    publisher
  });

  const post = require('./lib/post')({
    config,
    postStore,
    publisher
  });

  // Create new Express router
  const router = new express.Router({
    caseSensitive: true,
    mergeParams: true
  });

  // Parse application/json requests
  const jsonParser = express.json({
    limit: '10mb'
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

  // Use request parsers
  router.use(indieauth.authorize, urlencodedParser, jsonParser);

  // Query endpoint
  router.get('/', async (req, res, next) => {
    try {
      const response = await queryEndpoint(req, config);
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  });

  // Query media endpoint
  router.get('/media', (req, res, next) => {
    try {
      const response = queryMediaEndpoint(req);
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  });

  // Create/update/delete/undelete post
  router.post('/',
    multipartParser.any(),
    async (req, res, next) => {
      const action = req.query.action || req.body.action;
      const url = req.query.url || req.body.url;

      let response;
      try {
        if (action && url) {
          const postData = await readPostData(postStore, url);
          switch (action) {
            case 'delete': {
              if (indieauth.checkScope('delete')) {
                response = await post.delete(postData);
              }

              break;
            }

            case 'undelete': {
              if (indieauth.checkScope('create')) {
                response = await post.undelete(postData);
              }

              break;
            }

            case 'update': {
              if (indieauth.checkScope('update')) {
                response = await post.update(req, url, postData);
              }

              break;
            }

            default:
          }
        } else if (indieauth.checkScope('create')) {
          response = await post.create(req);
        }

        if (response) {
          res.header('Location', response.location);
          return res.status(response.status).json({
            success: response.success,
            success_description: response.success_description
          });
        }
      } catch (error) {
        return next(error);
      }
    }
  );

  // Upload media
  router.post('/media',
    multipartParser.single('file'),
    async (req, res, next) => {
      const {file} = req;
      try {
        const response = media.upload(req, file);
        if (response) {
          res.header('Location', response.location);
          return res.status(response.status).json({
            success: response.success,
            success_description: response.success_description
          });
        }
      } catch (error) {
        return next(error);
      }
    }
  );

  return router;
};
