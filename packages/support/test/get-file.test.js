const test = require('ava');
const nock = require('nock');
const Publisher = require('@indiekit/publisher-github');

const {getFile} = require('../.');

test('Throws error if file can’t be fetched from GitHub', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .replyWithError('not found');

  // Setup
  const github = new Publisher({
    token: 'abc123',
    user: 'user',
    repo: 'repo'
  });
  const error = await t.throwsAsync(async () => {
    await getFile('foo.txt', github);
  });

  // Test assertions
  t.is(error.message, 'foo.txt could not be found in the cache or at the specified remote location');
  scope.done();
});
