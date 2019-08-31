require('dotenv').config();

const nock = require('nock');
const test = require('ava');
const {requestToken} = require('../.');

test.before(t => {
  t.context.bearer = process.env.TEST_INDIEAUTH_TOKEN;
});

test('Returns an access token', async t => {
  // Setup
  const scope = nock('https://tokens.indieauth.com/token').get('')
    .reply(200, {
      client_id: 'https://client.example/',
      me: 'https://publication.example',
      scope: 'create update delete media'
    });
  const accessToken = await requestToken(t.context.bearer);

  // Test assertions
  t.is(String(accessToken.client_id), 'https://client.example/');
  scope.done();
});

test('Throws error if no access token provided', async t => {
  const error = await t.throwsAsync(requestToken(null));
  t.is(error.message, 'No token provided in request');
});

test('Throws error if token endpoint returns an error', async t => {
  // Setup
  const scope = nock('https://tokens.indieauth.com/token').get('')
    .reply(404, {
      error: 'Invalid request',
      error_description: 'The code provided was not valid'
    });
  const error = await t.throwsAsync(requestToken(t.context.bearer));

  // Test assertions
  t.is(error.message, 'The code provided was not valid');
  scope.done();
});

test('Throws error if can’t connect to token endpoint', async t => {
  // Setup
  const scope = nock('https://tokens.indieauth.com/token').get('')
    .replyWithError('The code provided was not valid');
  const error = await t.throwsAsync(requestToken(t.context.bearer));

  // Test assertions
  t.regex(error.message, /^FetchError/);
  scope.done();
});
