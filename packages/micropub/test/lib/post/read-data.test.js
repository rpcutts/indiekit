const test = require('ava');
const redis = require('redis-mock');
const JSONCache = require('redis-json');
const validUrl = require('valid-url');

const readData = require('../../../lib/post/read-data');

const client = redis.createClient();
const postStore = new JSONCache(client, {
  prefix: 'post:'
});

test.beforeEach(async () => {
  const url = 'https://website.example/foo';
  await postStore.set(url, {
    type: 'note',
    path: 'foo.md',
    url,
    mf2: {
      type: ['h-entry'],
      properties: {
        content: ['hello world'],
        published: ['2019-08-17T23:56:38.977+01:00'],
        category: ['foo', 'bar'],
        slug: ['baz']
      }
    }
  });
});

test.skip('Returns post data object', async t => {
  const postData = await readData(postStore, 'https://website.example/foo');
  t.is(postData.type, 'note');
  t.is(postData.path, 'foo.md');
  t.truthy(validUrl.isUri(postData.url));
  t.is(postData.mf2.type[0], 'h-entry');
  t.truthy(postData.mf2.properties);
});

test.skip('Throws error if no post store', async t => {
  const error = await t.throwsAsync(readData(null, 'https://website.example/foo'));
  t.is(error.message, 'No records found');
});

test.skip('Throws error if no post data recorded for given URL', async t => {
  const error = await t.throwsAsync(readData(postStore, 'https://website.example/bar'));
  t.is(error.message, 'No record found for https://website.example/bar');
});
