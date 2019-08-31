const fetch = require('node-fetch');
const {ServerError} = require('@indiekit/support');

/**
 * Requests an IndieAuth access token.
 *
 * @exports requestToken
 * @param {Object} bearerToken oAuth bearer token
 * @param {Object} opts Module options
 * @return {Object} Access token
 */
module.exports = async (bearerToken, opts = {}) => {
  // Throw error if no access token provided
  if (!bearerToken) {
    throw new ServerError('Unauthorized', 401, 'No token provided in request');
  }

  // Provide default token endpoint if none provided
  if (opts['token-endpoint'] === undefined) {
    opts['token-endpoint'] = 'https://tokens.indieauth.com/token';
  }

  let status;
  let accessToken;
  try {
    const response = await fetch(opts['token-endpoint'], {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    status = response.status;
    accessToken = await response.json();
  } catch (error) {
    throw new Error(error);
  }

  // Endpoint has responded, but with an error
  if (accessToken.error) {
    throw new ServerError(accessToken.error, status, accessToken.error_description);
  }

  return accessToken;
};
