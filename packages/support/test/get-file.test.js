const test = require('ava');
const nock = require('nock');
const {getFile} = require('../.');

test('Throws error if file can’t be fetched from GitHub', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .replyWithError('not found');

  // Setup
  const publisher = require('@indiekit/publisher-github');
  const error = await t.throwsAsync(async () => {
    await getFile('foo.txt', publisher);
  });

  // Test assertions
  t.is(error.message, 'foo.txt could not be found in the cache or at the specified remote location');
  scope.done();
});
