const path = require('path');
const nock = require('nock');
const test = require('ava');
const request = require('supertest');

const app = request(require('@indiekit/app'));

test.beforeEach(t => {
  t.context.token = process.env.TEST_INDIEAUTH_TOKEN;
  t.context.badToken = process.env.TEST_INDIEAUTH_TOKEN_NOSCOPE;
});

test('Responds to endpoint query', async t => {
  const response = await app.get('/media')
    .set('Accept', 'application/json')
    .query({q: 'last'});
  t.is(response.status, 200);
  t.deepEqual(response.body, {});
});

test('Returns 400 in response to unknown endpoint query', async t => {
  const response = await app.get('/media')
    .set('Accept', 'application/json')
    .query({q: 'foo'});
  t.is(response.status, 400);
  t.is(response.body.error_description, 'Invalid parameter: foo');
});

// Uses production app config; need to allow app to be configured independently
test.serial.skip('Uploads a media file', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .persist()
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);

  // Setup
  const image = path.resolve(__dirname, '../fixtures/photo.jpg');
  const response = await app.post('/media')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .attach('file', image);

  // Test assertions
  t.is(response.status, 201);
  t.is(response.body.success, 'create');
  t.regex(response.header.location, /\b[\d\w]{5}\b.jpg/g);
  scope.done();
});

test('Throws error creating media if token missing required scope', async t => {
  // Setup
  const image = path.resolve(__dirname, '../fixtures/photo.jpg');
  const response = await app.post('/media')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.badToken}`)
    .attach('file', image);

  // Test assertions
  t.is(response.status, 401);
  t.is(response.body.error_description, 'No scope(s) provided by access token');
});

test('Throws error if problem creating media', async t => {
  // Setup
  const response = await app.post('/media')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .attach('file', null);

  // Test assertions
  t.is(response.status, 400);
  t.is(response.body.error_description, 'No file included in request');
});
