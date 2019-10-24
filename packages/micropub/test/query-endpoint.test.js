const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const test = require('ava');

const pub = new Publication({
  defaults,
  endpointUrl: 'https://endpoint.example',
  me: process.env.INDIEKIT_URL
});

const {queryEndpoint} = require('../.');

test.before(async t => {
  t.context.posts = [{
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
  t.context.req = query => {
    const req = {};
    req.query = query;
    return req;
  };

  t.context.config = await pub.getConfig();
});

test('Returns publication configuration', async t => {
  const query = await t.context.req({q: 'config'});
  const result = await queryEndpoint(query, t.context.posts, t.context.config);
  t.is(result['media-endpoint'], 'https://endpoint.example/media');
});

test('Returns publication categories', async t => {
  const query = await t.context.req({q: 'category'});
  const result = await queryEndpoint(query, t.context.posts, t.context.config);
  t.deepEqual(result.categories, []);
});

test('Returns list of previously published posts', async t => {
  const query = await t.context.req({q: 'source'});
  const result = await queryEndpoint(query, t.context.posts, t.context.config);
  t.truthy(result.items[0].properties.content[0]);
});

test('Returns source (as mf2 object) for given URL', async t => {
  const query = await t.context.req({q: 'source', url: 'https://paulrobertlloyd.com/2018/11/warp_and_weft'});
  const result = await queryEndpoint(query, t.context.posts);
  t.truthy(result.properties);
});

test('Returns source (name property) for given URL', async t => {
  const query = await t.context.req({q: 'source', url: 'https://paulrobertlloyd.com/2018/11/warp_and_weft', properties: 'name'});
  const result = await queryEndpoint(query, t.context.posts);
  t.is(result.name[0], 'Warp and Weft');
});

test('Throws error if source URL cannot be found', async t => {
  const query = await t.context.req({q: 'source', url: 'https://website.example'});
  const error = await t.throwsAsync(queryEndpoint(query, t.context.posts, t.context.config));
  t.is(error.message, 'getaddrinfo ENOTFOUND website.example');
});

test('Returns any available configuration value', async t => {
  const query1 = await t.context.req({q: 'categories'});
  const result1 = await queryEndpoint(query1, t.context.posts, t.context.config);
  const query2 = await t.context.req({q: 'post-types'});
  const result2 = await queryEndpoint(query2, t.context.posts, t.context.config);
  t.truthy(result1.categories);
  t.truthy(result2['post-types']);
});

test('Throws error if request is missing query string', async t => {
  const query = await t.context.req(null);
  const error = await t.throwsAsync(queryEndpoint(query, t.context.posts));
  t.is(error.status, 400);
  t.is(error.message, 'Request is missing query string');
});

test('Throws error if unsupported query provided', async t => {
  const query = await t.context.req({foo: 'bar'});
  const error = await t.throwsAsync(queryEndpoint(query, t.context.posts, t.context.config));
  t.is(error.status, 400);
  t.is(error.message, 'Invalid query');
});

test('Throws error if unsupported parameter provided', async t => {
  const query = await t.context.req({q: 'foo'});
  const error = await t.throwsAsync(queryEndpoint(query, t.context.posts, t.context.config));
  t.is(error.status, 400);
  t.is(error.message, 'Invalid parameter: foo');
});
