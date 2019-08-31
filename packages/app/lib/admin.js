const express = require('express');
const indieauth = require('@indiekit/indieauth').middleware;
const {cache, ServerError} = require('@indiekit/support');

/**
 * Express middleware function for admin operations.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
  const admin = new express.Router({
    caseSensitive: true,
    mergeParams: true
  });

  admin.post('/',
    indieauth.authorize(opts.me),
    indieauth.checkScope('delete'),
    async (req, res, next) => {
      const {query} = req;

      if (query.cache) {
        switch (query.cache) {
          // Flush cache
          case 'flush': {
            cache.flushAll();
            return res.json({
              success: 'delete',
              success_description: 'Cache flushed'
            });
          }

          // Return list of cache keys
          case 'keys': {
            return res.json(cache.keys());
          }

          // Return value of cache key
          case 'key': {
            const {key} = query;
            try {
              return res.json(cache.get(key, true));
            } catch (error) {
              return next(new ServerError('Not found', 404, error.message));
            }
          }

          // Return cache statistics
          case 'stats': {
            return res.json(cache.getStats());
          }

          default:
        }
      }

      return next(new ServerError('Invalid request', 400, 'Request is missing required parameter'));
    }
  );

  return admin;
};
