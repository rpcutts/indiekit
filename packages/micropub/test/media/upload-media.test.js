require('dotenv').config();

const fs = require('fs');
const path = require('path');
const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
const validUrl = require('valid-url');
const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

const pub = new Publication({
  defaults,
  endpointUrl: 'https://endpoint.example',
  publisher: github,
  me: process.env.INDIEKIT_URL
});

const {uploadMedia} = require('../../.').media;

test.beforeEach(async t => {
  const photo = fs.readFileSync(path.resolve(__dirname, '../fixtures/photo.jpg'));
  t.context.file = {
    buffer: Buffer.from(photo),
    mimetype: 'image/jpg',
    originalname: 'photo.jpg'
  };
  t.context.req = () => {
    const req = {};
    req.session = sinon.stub().returns(req);
    return req;
  };

  t.context.media = [];
  t.context.config = await pub.getConfig();
});

test('Uploads a media file', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);
  const req = await t.context.req();
  const response = await uploadMedia(req, t.context.file, t.context.media, t.context.config);

  // Test assertions
  t.truthy(validUrl.isUri(response.url));
  scope.done();
});

test('Throws error if problem with specified file', async t => {
  const req = await t.context.req();
  const error = await t.throwsAsync(uploadMedia(req, null, t.context.media, t.context.config));
  t.is(error.message, 'No file included in request');
});

test('Throws publisher error uploading media', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .replyWithError('not found');
  const req = await t.context.req();
  const error = await t.throwsAsync(uploadMedia(req, t.context.file, t.context.media, t.context.config));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
