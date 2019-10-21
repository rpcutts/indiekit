const debug = require('debug')('indiekit:indieauth:verifyToken');
const HttpError = require('http-errors');
const normalizeUrl = require('normalize-url');

/**
 * Verifies that access token provides permissions to post to publication.
 *
 * @exports verifyToken
 * @param {Object} opts Module options
 * @param {Object} accessToken Access token
 * @return {Object} Verified access token
 */
module.exports = (opts, accessToken) => {
  debug('verifyToken opts', opts);

  // Throw error if no publication URL provided
  if (!opts.me) {
    throw new HttpError.InternalServerError('No publication URL provided');
  }

  // Throw error if no access token provided
  if (!accessToken) {
    throw new HttpError.Unauthorized('No access token provided in request');
  }

  // Throw error if access token does not contain a `me` value
  if (!accessToken.me) {
    throw new HttpError.Unauthorized('There was a problem with this access token');
  }

  // Normalize publication and token URLs before comparing
  const accessTokenMe = normalizeUrl(accessToken.me);
  const publicationMe = normalizeUrl(opts.me);
  const isAuthenticated = accessTokenMe === publicationMe;

  debug('Verified token URL: %s', accessTokenMe);
  debug('Publication URL: %s', publicationMe);

  // Publication URL does not match that provided by access token
  if (!isAuthenticated) {
    throw new HttpError.Forbidden('User does not have permission to perform request');
  }

  return accessToken;
};
