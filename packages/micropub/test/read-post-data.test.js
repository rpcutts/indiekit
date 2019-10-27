const test = require('ava');
const validUrl = require('valid-url');

const readPostData = require('../lib/read-post-data');

const postStore = [{
  type: 'note',
  path: 'foo.md',
  url: 'https://website.example/foo',
  mf2: {
    type: ['h-entry'],
    properties: {
      content: ['hello world'],
      published: ['2019-08-17T23:56:38.977+01:00'],
      category: ['foo', 'bar'],
      slug: ['baz']
    }
  }
}];

test('Returns post data object', t => {
  const postData = readPostData(postStore, 'https://website.example/foo');
  t.is(postData.type, 'note');
  t.is(postData.path, 'foo.md');
  t.truthy(validUrl.isUri(postData.url));
  t.is(postData.mf2.type[0], 'h-entry');
  t.truthy(postData.mf2.properties);
});

test('Throws error if no post store', t => {
  const error = t.throws(() => {
    readPostData(null, 'https://website.example/foo');
  });
  t.is(error.message, 'No records found');
});

test('Throws error if no post data recorded for given URL', t => {
  const error = t.throws(() => {
    readPostData(postStore, 'https://website.example/bar');
  });
  t.is(error.message, 'No record found for https://website.example/bar');
});
