require('dotenv').config();

const test = require('ava');
const {verifyToken} = require('../.');

test.before(t => {
  t.context.me = process.env.INDIEKIT_URL;
  t.context.token = {
    access_token: '123456',
    scope: 'create update',
    me: process.env.INDIEKIT_URL
  };
});

test('Returns access token if publication URL matches that in token', t => {
  const verifiedToken = verifyToken(t.context.token, t.context.me);
  t.is(verifiedToken, t.context.token);
});

test('Throws error if no access token provided', t => {
  const error = t.throws(() => {
    verifyToken(null, t.context.me);
  });
  t.is(error.message, 'No access token provided in request');
});

test('Throws error if no publication URL provided', t => {
  const error = t.throws(() => {
    verifyToken(t.context.token, null);
  });
  t.is(error.message, 'Publication URL not configured');
});

test('Throws error if publication URL not authenticated by token', t => {
  const error = t.throws(() => {
    verifyToken(t.context.token, 'https://foo.bar');
  });
  t.is(error.message, 'User does not have permission to perform request');
});

test('Throws error if token endpoint does not return a me value', t => {
  const error = t.throws(() => {
    verifyToken({}, t.context.me);
  });
  t.is(error.message, 'There was a problem with this access token');
});
