const fetch = require('node-fetch');
const normalizeUrl = require('normalize-url');
const {ServerError} = require('@indiekit/support');

/**
 * Authenticates a URL.
 *
 * @exports authenticate
 * @param {Object} code Code returned from IndieLogin
 * @param {Object} me Publication URL
 * @param {Object} opts Module options
 * @return {Boolean} Returns true if authenticated
 */
module.exports = async (code, me, opts) => {
  console.log('AUTHENTICATION FUNCTION');
  let authentication;
  let status;

  try {
    const searchParams = new URLSearchParams();
    searchParams.set('client_id', opts.client_id);
    searchParams.set('code', code);
    searchParams.set('redirect_uri', opts.redirect_uri);
    searchParams.set('scope', 'create');

    const response = await fetch('https://indielogin.com/auth', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: searchParams
    });

    status = response.status;
    authentication = await response.json();
  } catch (error) {
    throw new ServerError(
      error.name,
      status,
      error.message
    );
  }

  // Authentication endpoint has responded, but with an error
  if (authentication.error) {
    throw new ServerError(
      authentication.error,
      status,
      authentication.error_description
    );
  }

  const authenticatedMe = normalizeUrl(authentication.me);
  const publicationMe = normalizeUrl(me);
  const isAuthenticated = authenticatedMe === publicationMe;

  if (!isAuthenticated) {
    throw new ServerError(
      'Access denied',
      403,
      'User does not have permission to access this site'
    );
  }

  return true;
};
