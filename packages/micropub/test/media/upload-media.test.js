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
  url: process.env.INDIEKIT_URL
});

const {uploadMedia} = require('../../.').media;

test.beforeEach(t => {
  const image = fs.readFileSync(path.resolve(__dirname, '../fixtures/image.gif'));
  t.context.file = {
    buffer: Buffer.from(image),
    mimetype: 'image/gif',
    originalname: 'image.gif'
  };
  t.context.req = async () => {
    const req = {};
    req.session = sinon.stub().returns(req);
    req.app = {
      locals: {
        pub: await pub.getConfig()
      }
    };
    return req;
  };
});

test('Uploads a media file', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);
  const req = await t.context.req();
  const response = await uploadMedia(req, t.context.file);

  // Test assertions
  t.truthy(validUrl.isUri(response.url));
  scope.done();
});

test('Throws error if problem with specified file', async t => {
  const req = await t.context.req();
  const error = await t.throwsAsync(uploadMedia(req, null));
  t.is(error.message, 'No file included in request');
});

test('Throws publisher error uploading media', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .replyWithError('not found');
  const req = await t.context.req();
  const error = await t.throwsAsync(uploadMedia(req, t.context.file));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
