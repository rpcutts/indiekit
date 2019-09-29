const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Creates a file in a repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(uri => uri.includes('foo.txt'))
    .reply(200, {
      commit: {
        message: 'Create message'
      }
    });

  // Setup
  const response = await github.createFile('bar/foo.txt', 'foo', 'Create message');

  // Test assertions
  t.truthy(response);
  t.is(response.data.commit.message, 'Create message');
  scope.done();
});

test('Throws error creating a file in a repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(uri => uri.includes('foo.txt'))
    .replyWithError('not found');

  // Setup
  const error = await t.throwsAsync(github.createFile('bar/foo.txt', 'foo', 'Create message'));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
