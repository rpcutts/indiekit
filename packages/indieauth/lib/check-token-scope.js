const {ServerError, logger} = require('@indiekit/support');

/**
 * Checks if scope(s) in authenticated token contains required scope.
 * Automatically handles `post` and `create` as the same thing.
 *
 * @exports checkTokenScope
 * @param {String} requiredScope Required scope
 * @param {Object} tokenScope Scope(s) provided by access token
 * @return {Boolean} True if tokenScope includes requiredScope
 */
module.exports = (requiredScope, tokenScope) => {
  logger.debug('indieauth.checkScope, required scope: %s', requiredScope);
  logger.debug('indieauth.checkScope, token scope: %s', tokenScope);

  if (!requiredScope) {
    throw new ServerError('Invalid request', 400, 'No scope was provided in request');
  }

  if (!tokenScope) {
    throw new ServerError('Insufficient scope', 401, 'Access token does not provide any scope(s)');
  }

  const scopes = tokenScope.split(' ');
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
