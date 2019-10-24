const test = require('ava');

const checkTokenScope = require('../lib/check-token-scope');

test('Returns true if required scope is provided by token', async t => {
  const opts = {token: {scope: 'create update'}};
  const hasScope = await checkTokenScope(opts, 'update');
  t.true(hasScope);
});

test('Returns true if required scope is `create` but token provides `post`', async t => {
  const opts = {token: {scope: 'post'}};
  const hasScope = await checkTokenScope(opts, 'create');
  t.true(hasScope);
});

test('Returns true if required scope is `post` but token provides `create`', async t => {
  const opts = {token: {scope: 'create'}};
  const hasScope = await checkTokenScope(opts, 'post');
  t.true(hasScope);
});

test('Throws error if no access token provided', async t => {
  const opts = {token: null};
  const error = await t.throwsAsync(checkTokenScope(opts, 'delete'));
  t.is(error.status, 401);
  t.is(error.message, 'No access token provided');
});

test('Throws error if no scope provided in access token', async t => {
  const opts = {token: {}};
  const error = await t.throwsAsync(checkTokenScope(opts, 'delete'));
  t.is(error.status, 401);
  t.is(error.message, 'No scope(s) provided by access token');
});

test('Throws error if required scope not provided', async t => {
  const opts = {token: {scope: 'create update'}};
  const error = await t.throwsAsync(checkTokenScope(opts, null));
  t.is(error.status, 400);
  t.is(error.message, 'No scope provided in request');
});

test('Throws error if required scope not provided by access token', async t => {
  const opts = {token: {scope: 'create update'}};
  const error = await t.throwsAsync(checkTokenScope(opts, 'delete'));
  t.is(error.status, 401);
  t.is(error.message, 'Access token does not meet requirements for requested scope (delete)');
});
