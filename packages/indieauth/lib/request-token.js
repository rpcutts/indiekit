const debug = require('debug')('indiekit:indieauth:requestToken');
const httpError = require('http-errors');
const fetch = require('node-fetch');

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
    throw new httpError.Unauthorized('No token provided in request');
  }

  let accessToken;
  try {
    const response = await fetch(opts.tokenEndpoint, {
      method: 'get',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    accessToken = await response.json();
  } catch (error) {
    throw new httpError.InternalServerError(error.message);
  }

  // Endpoint has responded, but with an error
  if (accessToken.error) {
    throw new httpError.InternalServerError(accessToken.error_description);
  }

  return accessToken;
};
