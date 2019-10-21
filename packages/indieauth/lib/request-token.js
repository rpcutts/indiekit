const axios = require('axios');
const debug = require('debug')('indiekit:indieauth:requestToken');
const HttpError = require('http-errors');

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
    throw new HttpError.Unauthorized('No token provided in request');
  }

  let accessToken;
  try {
    const response = await axios.get(opts.tokenEndpoint, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    accessToken = response.data;
  } catch (error) {
    const {response} = error;
    if (response && response.data.error_description) {
      throw new HttpError(response.status, response.data.error_description);
    } else {
      throw new HttpError(error.status, error.message);
    }
  }

  return accessToken;
};
