const test = require('ava');
const {checkTokenScope} = require('../.');

test('Returns true if required scope is provided by token', t => {
  const hasScope = checkTokenScope('update', 'create update');
  t.true(hasScope);
});

test('Returns true if required scope is `create` but token provides `post`', t => {
  const hasScope = checkTokenScope('create', 'post');
  t.true(hasScope);
});

test('Returns true if required scope is `post` but token provides `create`', t => {
  const hasScope = checkTokenScope('post', 'create');
  t.true(hasScope);
});

test('Throws error if no scope provided in access token', t => {
  const error = t.throws(() => {
    checkTokenScope('delete', null);
  });
  t.is(error.message, 'Access token does not provide any scope(s)');
});

test('Throws error if required scope not provided', t => {
  const error = t.throws(() => {
    checkTokenScope(null, 'create update');
  });
  t.is(error.message, 'No scope was provided in request');
});

test('Throws error if required scope not provided by access token', t => {
  const error = t.throws(() => {
    checkTokenScope('delete', 'create update');
  });
  t.is(error.message, 'Access token does not meet requirements for requested scope (delete)');
});
