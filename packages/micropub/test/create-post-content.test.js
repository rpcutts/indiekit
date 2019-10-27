const fs = require('fs');
const path = require('path');
const test = require('ava');

const createPostContent = require('../lib/create-post-content');

const postData = {
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
};

const pub = {
  'post-type-config': {
    note: {
      template: path.resolve(__dirname, 'fixtures/template.njk')
    }
  }
};

test('Creates post content by populating post template with post data.', async t => {
  // Setup
  const postContent = await createPostContent(postData, pub);

  // Test assertions
  t.true(postContent.includes('hello world'));
  t.true(postContent.includes('foo'));
  t.true(postContent.includes('bar'));
});
