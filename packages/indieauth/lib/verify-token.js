const {ServerError, logger} = require('@indiekit/support');
const normalizeUrl = require('normalize-url');

/**
 * Verifies that access token provides permissions to post to publication.
 *
 * @exports verifyToken
 * @param {Object} accessToken Access token
 * @param {Object} me Publication URL
 * @return {Object} Verified access token
 */
module.exports = (accessToken, me) => {
  // Throw error if no access token provided
  if (!accessToken) {
    throw new ServerError('Unauthorized', 401, 'No access token provided in request');
  }

  // Throw error if no publication URL provided
  if (!me) {
    throw new ServerError('Configuration error', 500, 'Publication URL not configured');
  }

  // Throw error if access token does not contain a `me` value
  if (!accessToken.me) {
    throw new ServerError('Not found', 404, 'There was a problem with this access token');
  }

  // Normalize publication and token URLs before comparing
  const accessTokenMe = normalizeUrl(accessToken.me);
  const publicationMe = normalizeUrl(me);
  const isAuthenticated = accessTokenMe === publicationMe;

  logger.debug('indieauth.verifyToken, verified token URL: %s', accessTokenMe);
  logger.debug('indieauth.verifyToken, publication URL: %s', publicationMe);

  // Publication URL does not match that provided by access token
  if (!isAuthenticated) {
    throw new ServerError('Access denied', 403, 'User does not have permission to perform request');
  }

  return accessToken;
};
