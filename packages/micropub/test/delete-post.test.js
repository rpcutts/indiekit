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

const {deletePost} = require('../.');

const mockRequest = () => {
  const req = {};
  req.status = sinon.stub().returns(req);
  req.json = sinon.stub().returns(req);
  req.app = {
    locals: {
      pub: new Publication({
        defaults,
        endpointUrl: 'https://endpoint.example',
        publisher: github,
        url: process.env.INDIEKIT_URL
      })
    }
  };
  return req;
};

test.before(t => {
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
  const deleted = await deletePost(mockRequest(), t.context.postData);

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
  const error = await t.throwsAsync(deletePost(mockRequest(), t.context.postData));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
