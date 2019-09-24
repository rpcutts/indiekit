const express = require('express');
const multer = require('multer');
const indieauth = require('@indiekit/indieauth').middleware;

const action = require('./action');
const queryEndpoint = require('./query-endpoint');

/**
 * Express middleware function for Micropub endpoint.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
  // Create new Express router
  const post = new express.Router({
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

  post.get('/',
    urlencodedParser,
    async (req, res, next) => {
      const {posts} = req.session;

      try {
        const response = await queryEndpoint(req, posts);
        return res.json(response);
      } catch (error) {
        return next(error);
      }
    }
  );

  post.post('/',
    indieauth.authorize(opts.me),
    multipartParser.any(),
    jsonParser,
    urlencodedParser,
    (req, res, next) => {
      // Determine action, and continue if token has required scope
      const action = req.query.action || req.body.action;
      if (action === 'delete') {
        return indieauth.checkScope('delete')(req, res, next);
      }

      if (action === 'update') {
        return indieauth.checkScope('update')(req, res, next);
      }

      return indieauth.checkScope('create')(req, res, next);
    },
    async (req, res, next) => {
      const {posts} = req.session;
      const {media} = req.session;

      try {
        const response = await action(req, posts, media);
        res.header('Location', response.location);
        return res.status(response.status).json({
          success: response.success,
          success_description: response.success_description
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  return post;
};
