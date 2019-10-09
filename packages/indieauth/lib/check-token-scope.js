const debug = require('debug')('indiekit:indieauth:checkTokenScope');
const {ServerError} = require('@indiekit/support');

/**
 * Checks if scope(s) in authenticated token contains required scope.
 * Automatically handles `post` and `create` as the same thing.
 *
 * @exports checkTokenScope
 * @param {Object} opts Module options
 * @param {String} requiredScope Required scope
 * @return {Boolean} True if tokenScope includes requiredScope
 */
module.exports = async (opts, requiredScope) => {
  if (!opts.token) {
    throw new ServerError('Unauthorized', 401, 'No access token provided');
  }

  const {scope} = await opts.token;
  if (!scope) {
    throw new ServerError('Insufficient scope', 401, 'No scope(s) provided by access token');
  }

  if (!requiredScope) {
    throw new ServerError('Invalid request', 400, 'No scope provided in request');
  }

  debug('Required scope: %s', requiredScope);
  debug('Token scope: %s', scope);
  const scopes = scope.split(' ');
  let hasScope = scopes.includes(requiredScope);

  // Create and post are equal
  if (requiredScope === 'post' && !hasScope) {
    hasScope = scopes.includes('create');
  }

  if (requiredScope === 'create' && !hasScope) {
    hasScope = scopes.includes('post');
  }

  if (hasScope) {
    return true;
  }

  throw new ServerError('Insufficient scope', 401, `Access token does not meet requirements for requested scope (${requiredScope})`);
};
