const fetch = require('node-fetch');
const {ServerError} = require('@indiekit/support');

/**
 * Requests an IndieAuth access token.
 *
 * @exports requestToken
 * @param {Object} opts Module options
 * @param {Object} bearerToken oAuth bearer token
 * @return {Object} Access token
 */
module.exports = async (opts, bearerToken) => {
  if (!bearerToken) {
    throw new ServerError('Unauthorized', 401, 'No token provided in request');
  }

  let status;
  let accessToken;
  try {
    const response = await fetch(opts.tokenEndpoint, {
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
