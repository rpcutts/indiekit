const checkTokenScope = require('./check-token-scope');
const requestToken = require('./request-token');
const verifyToken = require('./verify-token');

/**
 * Express middleware functions for performing IndieAuth operations.
 */
module.exports = {
  /**
   * @exports authorize
   * @param {Object} me Publication URL
   * @param {Object} req Express request
   * @param {Object} res Express response
   * @param {Function} next Express callback
   * @return {Function} next Express callback
   */
  authorize: me => async (req, res, next) => {
    let bearerToken;
    if (req.headers && req.headers.authorization) {
      bearerToken = req.headers.authorization.trim().split(/\s+/)[1];
    } else if (!bearerToken && req.body && req.body.access_token) {
      bearerToken = req.body.access_token;
      delete req.body.access_token; // Delete token from body if exists
    }

    try {
      const accessToken = await requestToken(bearerToken);
      const verifiedToken = verifyToken(accessToken, me);
      req.session.indieauthToken = verifiedToken;
      return next();
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @exports checkScope
   * @param {String} requiredScope Scope to check
   * @param {Object} req Express request
   * @param {Object} res Express response
   * @param {Function} next Express callback
   * @return {Function} next Express callback
   */
  checkScope: requiredScope => (req, res, next) => {
    const {scope} = req.session.indieauthToken;

    try {
      checkTokenScope(requiredScope, scope);
      return next();
    } catch (error) {
      return next(error);
    }
  }
};
