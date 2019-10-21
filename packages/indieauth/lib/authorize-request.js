const debug = require('debug')('indiekit:indieauth:authorizeRequest');
const HttpError = require('http-errors');
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

  try {
    debug('Bearer token: %s', bearerToken);
    const accessToken = await requestToken(opts, bearerToken);
    debug('Access token: %s', accessToken);
    const verifiedToken = verifyToken(opts, accessToken);
    debug('Verified token: %s', verifiedToken);
    return verifiedToken;
  } catch (error) {
    throw new HttpError(error.status, error.message);
  }
};
