const debug = require('debug')('indiekit:indieauth:authorizeRequest');
const requestToken = require('./request-token');
const verifyToken = require('./verify-token');

/**
 * @exports authorizeRequest
 * @param {Object} opts Module options
 * @param {Object} req Request
 */
module.exports = async (opts, req) => {
  let bearerToken;
  if (req.headers && req.headers.authorization) {
    bearerToken = req.headers.authorization.trim().split(/\s+/)[1];
  } else if (!bearerToken && req.body && req.body.access_token) {
    bearerToken = req.body.access_token;
    delete req.body.access_token; // Delete token from body if exists
  }

  debug('Bearer token scope: %s', bearerToken);
  const accessToken = await requestToken(opts, bearerToken);
  const verifiedToken = verifyToken(opts, accessToken);
  return verifiedToken;
};
