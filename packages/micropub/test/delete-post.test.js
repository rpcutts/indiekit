require('dotenv').config();

const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
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

const {deletePost} = require('../.');

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
  t.context.req = async body => {
    const req = {};
    req.body = body;
    req.status = sinon.stub().returns(req);
    req.json = sinon.stub().returns(req);
    return req;
  };

  t.context.config = await pub.getConfig();
});

test('Deletes a post', async t => {
  // Mock GitHub delete file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b'
    })
    .delete(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy',
      commit: {
        message: 'Delete message'
      }
    });

  // Setup
  const req = await t.context.req({
    action: 'delete',
    url: 'https://foo.bar/baz'
  });
  const deleted = await deletePost(req, t.context.postData, t.context.config);

  // Test assertions
  t.true(deleted);
  scope.done();
});

test('Throws publisher error deleting a post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b'
    })
    .delete(uri => uri.includes('baz.md'))
    .replyWithError('not found');

  // Setup
  const req = await t.context.req({
    action: 'delete',
    url: 'https://foo.bar/baz'
  });
  const error = await t.throwsAsync(deletePost(req, t.context.postData, t.context.config));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
