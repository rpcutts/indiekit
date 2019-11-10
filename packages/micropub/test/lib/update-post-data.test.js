require('dotenv').config();

const Publication = require('@indiekit/publication');
const sinon = require('sinon');
const test = require('ava');

const pub = new Publication({
  defaults: require('@indiekit/config-jekyll'),
  endpointUrl: 'https://endpoint.example',
  me: process.env.INDIEKIT_URL
});

const updatePostData = require('../../lib/update-post-data');

test.beforeEach(async t => {
  t.context.req = body => {
    const req = {};
    req.body = body;
    req.session = sinon.stub().returns(req);
    req.status = sinon.stub().returns(req);
    req.json = sinon.stub().returns(req);
    return req;
  };

  t.context.postData = {
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

  t.context.config = await pub.getConfig();
});

test('Updates post data by replacing its content', async t => {
  const postContent = await updatePostData(t.context.req({
    action: 'update',
    url: 'https://foo.bar/baz',
    replace: {
      content: ['hello moon']
    }
  }), t.context.postData, t.context.config);
  t.is(postContent.mf2.properties.content[0], 'hello moon');
});

test('Updates post data by adding a syndication value', async t => {
  const postContent = await updatePostData(t.context.req({
    action: 'update',
    url: 'https://foo.bar/baz',
    add: {
      syndication: ['http://web.archive.org/web/20190818120000/https://foo.bar/baz']
    }
  }), t.context.postData, t.context.config);
  t.is(postContent.mf2.properties.syndication[0], 'http://web.archive.org/web/20190818120000/https://foo.bar/baz');
});

test('Updates post data by deleting a property', async t => {
  const postContent = await updatePostData(t.context.req({
    action: 'update',
    url: 'https://foo.bar/baz',
    delete: ['category']
  }), t.context.postData, t.context.config);
  t.falsy(postContent.mf2.properties.category);
});

test('Updates post data by deleting an entry in a property', async t => {
  const postContent = await updatePostData(t.context.req({
    action: 'update',
    url: 'https://foo.bar/baz',
    delete: {
      category: ['foo']
    }
  }), t.context.postData, t.context.config);
  t.deepEqual(postContent.mf2.properties.category, ['bar']);
});

test('Throws error', async t => {
  const error = await t.throwsAsync(updatePostData(t.context.req({
    action: 'update',
    url: 'https://foo.bar/baz',
    add: {
      syndication: ['http://web.archive.org/web/20190818120000/https://foo.bar/baz']
    }
  }), null, t.context.config));
  t.is(error.message, 'Cannot destructure property `type` of \'undefined\' or \'null\'.');
});
