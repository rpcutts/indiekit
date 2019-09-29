const authenticate = require('./authenticate');
const checkTokenScope = require('./check-token-scope');
const requestToken = require('./request-token');
const verifyToken = require('./verify-token');

/**
 * Express middleware functions for performing IndieAuth operations.
 */
module.exports = {
  /**
   * @exports login
   * @param {Object} code Code returned from IndieLogin
   * @param {Object} state Random check value
   * @param {Object} me Publication URL
   * @param {Object} opts Authentication values
   * @param {Object} req Express request
   * @param {Object} res Express response
   * @param {Function} next Express callback
   * @return {Function} next Express callback
   */
  login: (code, state, me, opts) => async (req, res, next) => {
    console.log('LOGIN MIDDLEWARE');

    // Check that state provided matches that in session
    verifyState(req.session.state, state).catch(error => {
      return next(error);
    });

    const authenticated = await authenticate({
      code,
      client_id: opts.client_id,
      redirect_uri: opts.redirect_uri,
      me
    }).catch(error => {
      console.error(error);
      return next(error);
    });

    if (authenticated) {
      console.log('req.session, before', req.session);
      console.log('authenticated.me', authenticated.me);
      req.session.me = authenticated.me;
      console.log('req.session, after', req.session);
      res.redirect(opts.redirect_uri);
    }
  },

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
