const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Deletes a file in a repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b'
    })
    .delete(uri => uri.includes('foo.txt'))
    .reply(200, {
      content: null,
      commit: {
        message: 'Delete message'
      }
    });

  // Setup
  const response = await github.deleteFile('foo.txt', 'Delete message');

  // Test assertions
  t.is(response.status, 200);
  t.is(response.data.commit.message, 'Delete message');
  scope.done();
});

test('Throws error if file not found in repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .replyWithError('not found');

  // Setup
  const error = await t.throwsAsync(github.deleteFile('foo.txt', 'Delete message'));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});

test('Throws error deleting a file in a repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b'
    })
    .delete(uri => uri.includes('foo.txt'))
    .replyWithError('unknown error');

  // Setup
  const error = await t.throwsAsync(github.deleteFile('foo.txt', 'Delete message'));

  // Test assertions
  t.regex(error.message, /\bunknown error\b/);
  scope.done();
});
