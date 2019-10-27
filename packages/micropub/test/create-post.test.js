require('dotenv').config();

const fs = require('fs');
const os = require('os');
const path = require('path');
const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
const validUrl = require('valid-url');
const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const Publisher = require('@indiekit/publisher-github');

const pkg = require(process.env.PWD + '/package');

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

const {createPost} = require('../.');

test.before(async t => {
  t.context.req = () => {
    const req = {};
    req.body = {
      // access_token: process.env.TEST_INDIEAUTH_TOKEN,
      type: ['h-entry'],
      properties: {
        content: [{
          value: 'Watched Isle of Dogs. A fun yet timely story. An inventive example of stop-motion animation. A beautiful piece of graphic design. A work of art. A visual feast - with dogs!'
        }]
      }
    };
    req.is = sinon.stub().returns(req);
    req.session = sinon.stub().returns(req);
    req.status = sinon.stub().returns(req);
    req.json = sinon.stub().returns(req);
    return req;
  };

  t.context.config = await pub.getConfig();
  t.context.posts = [];
});

test.serial('Creates a note post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .reply(200);

  // Setup
  const req = await t.context.req();
  const created = await createPost(req, t.context.posts, t.context.config);

  // Test assertions
  t.truthy(validUrl.isUri(created.url));
  scope.done();
});

test.serial('Throws publisher error creating a post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .replyWithError('not found');

  // Setup
  const req = await t.context.req();
  const error = await t.throwsAsync(createPost(req, t.context.posts, t.context.config));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
