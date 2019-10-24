require('dotenv').config();

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

const {undeletePost} = require('../.');

test.before(async t => {
  t.context.postData = {
    type: 'note',
    path: '_notes/2019-08-17-baz.md',
    url: `${process.env.INDIEKIT_URL}/notes/2019/08/17/baz`,
    mf2: {
      type: ['h-entry'],
      properties: {
        content: ['Baz']
      },
      slug: ['baz']
    }
  };
  t.context.req = body => {
    const req = {};
    req.body = body;
    req.status = sinon.stub().returns(req);
    req.json = sinon.stub().returns(req);
    return req;
  };

  t.context.config = await pub.getConfig();
});

test('Undeletes a post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(uri => uri.includes('baz.md'))
    .reply(200);

  // Setup
  const req = await t.context.req({
    action: 'undelete',
    url: 'https://foo.bar/baz'
  });
  const undeleted = await undeletePost(req, t.context.postData, t.context.config);

  // Test assertions
  t.truthy(validUrl.isUri(undeleted.url));
  scope.done();
});

test('Throws error if GitHub responds with an error', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(uri => uri.includes('baz.md'))
    .replyWithError('not found');

  // Setup
  const req = await t.context.req({
    action: 'delete',
    url: 'https://foo.bar/baz'
  });
  const error = await t.throwsAsync(undeletePost(req, t.context.postData, t.context.config));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
