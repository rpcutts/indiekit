const test = require('ava');
const validUrl = require('valid-url');

const readData = require('../../../lib/post/read-data');

const postStore = {
  get: key => {
    if (key === 'https://website.example/foo') {
      return {
        type: 'note',
        path: 'foo.md',
        url: 'https://website.example/foo',
        mf2: {
          type: ['h-entry'],
          properties: {}
        }
      };
    }
  }
};

test('Throws error if no post store', async t => {
  const error = await t.throwsAsync(readData(null, 'https://website.example/foo'));
  t.is(error.message, 'No records found');
});

test('Throws error if no post data recorded for given URL', async t => {
  const error = await t.throwsAsync(readData(postStore, 'https://website.example/bar'));
  t.is(error.message, 'No record found for https://website.example/bar');
});

test('Returns post data object', async t => {
  const postData = await readData(postStore, 'https://website.example/foo');
  t.is(postData.type, 'note');
  t.is(postData.path, 'foo.md');
  t.truthy(validUrl.isUri(postData.url));
  t.is(postData.mf2.type[0], 'h-entry');
  t.truthy(postData.mf2.properties);
});
