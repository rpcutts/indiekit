const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Reads a file in a repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b',
      name: 'foo.txt'
    });

  // Setup
  const response = await github.readFile('foo.txt');

  // Test assertions
  t.is(response, 'foobar');
  scope.done();
});

test('Throws error reading a file in a repository', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .replyWithError('not found');

  // Setup
  const error = await t.throwsAsync(async () => {
    await github.readFile('bar/foo.txt');
  });

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
