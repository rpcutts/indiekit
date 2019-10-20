const debug = require('debug')('indiekit:micropub');
const express = require('express');
const multer = require('multer');
const IndieAuth = require('@indiekit/indieauth');

const action = require('./action');
const queryEndpoint = require('./query-endpoint');

/**
 * Express middleware function for Micropub endpoint.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
  const {config} = opts;

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

  // Configure IndieAuth middleware
  const indieauth = new IndieAuth({
    me: config.me
  });

  post.get('/',
    urlencodedParser,
    async (req, res, next) => {
      const {posts} = req.session;

      try {
        const response = await queryEndpoint(req, posts, config);
        debug('queryEndpoint response', response);
        return res.json(response);
      } catch (error) {
        return next(error);
      }
    }
  );

  post.post('/',
    indieauth.authorize,
    multipartParser.any(),
    jsonParser,
    urlencodedParser,
    (req, res, next) => {
      // Determine action, and continue if token has required scope
      const action = req.query.action || req.body.action;
      debug('action', action);
      if (action === 'delete') {
        try {
          indieauth.checkScope('delete');
          return next();
        } catch (error) {
          return next(error);
        }
      }

      if (action === 'update') {
        try {
          indieauth.checkScope('update');
          return next();
        } catch (error) {
          return next(error);
        }
      }

      try {
        indieauth.checkScope('create');
        return next();
      } catch (error) {
        return next(indieauth.checkScope('create'));
      }
    },
    async (req, res, next) => {
      const store = req.session; // Should be opts.store

      try {
        const response = await action(req, store, config);
        res.header('Location', response.location);
        return res.status(response.status).json({
          success: response.success,
          success_description: response.success_description
        });
      } catch (error) {
        debug('action error', error);
        return next(error);
      }
    }
  );

  return post;
};
