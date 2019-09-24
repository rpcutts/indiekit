const nock = require('nock');
const test = require('ava');
const getCategories = require('../lib/get-categories');

test('Returns array if categories provided', async t => {
  const result = await getCategories(['foo', 'bar']);
  t.deepEqual(result, ['foo', 'bar']);
});

test('Returns empty array if categories not an array', async t => {
  const result = await getCategories({foo: 'bar'});
  t.deepEqual(result, []);
});

test('Returns array if url to JSON file provided', async t => {
  // Mock request
  const scope = nock('https://foo.bar')
    .get('/categories.json')
    .reply(200, ['foo', 'bar']);

  // Setup result
  const result = await getCategories({
    url: 'https://foo.bar/categories.json'
  });

  // Test assertions
  t.deepEqual(result, ['foo', 'bar']);
  scope.done();
});

test('Throws error if JSON file provided not found', async t => {
  // Mock request
  const scope = nock('https://foo.bar')
    .get('/categories.json')
    .replyWithError('not found');

  // Setup error
  const error = await t.throwsAsync(getCategories({
    url: 'https://foo.bar/categories.json'
  }));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
