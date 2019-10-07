const test = require('ava');

const verifyToken = require('../lib/verify-token');

const me = 'https://website.example';

test.before(t => {
  t.context.me = me;
  t.context.token = {
    access_token: '123456',
    scope: 'create update',
    me
  };
});

test('Returns access token if publication URL matches that in token', t => {
  const opts = {me: t.context.me};
  const verifiedToken = verifyToken(opts, t.context.token);
  t.is(verifiedToken, t.context.token);
});

test('Throws error if no access token provided', t => {
  const opts = {me: t.context.me};
  const error = t.throws(() => {
    verifyToken(opts, null);
  });
  t.is(error.message, 'No access token provided in request');
});

test('Throws error if no publication URL provided', t => {
  const opts = {me: null};
  const error = t.throws(() => {
    verifyToken(opts, t.context.token);
  });
  t.is(error.message, 'No publication URL provided');
});

test('Throws error if publication URL not authenticated by token', t => {
  const opts = {me: 'https://foo.bar'};
  const error = t.throws(() => {
    verifyToken(opts, t.context.token);
  });
  t.is(error.message, 'User does not have permission to perform request');
});

test('Throws error if token endpoint does not return a me value', t => {
  const opts = {me: t.context.me};
  const error = t.throws(() => {
    verifyToken(opts, {});
  });
  t.is(error.message, 'There was a problem with this access token');
});
