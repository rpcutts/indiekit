const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const test = require('ava');

const {queryEndpoint} = require('../.');

test.before(t => {
  const testPub = new Publication({
    defaults,
    endpointUrl: 'https://endpoint.example',
    url: process.env.INDIEKIT_URL
  });
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
  t.context.req = (query, pub = testPub) => {
    const req = {};
    req.app = {
      locals: {
        pub
      }
    };
    req.query = query;
    return req;
  };
});

test('Returns publication configuration', async t => {
  const result = await queryEndpoint(t.context.req({q: 'config'}), t.context.posts);
  t.is(result['media-endpoint'], 'https://endpoint.example/media');
});

test('Returns publication categories', async t => {
  const result = await queryEndpoint(t.context.req({q: 'category'}), t.context.posts);
  t.deepEqual(result.categories, []);
});

test('Returns list of previously published posts', async t => {
  const result = await queryEndpoint(t.context.req({q: 'source'}), t.context.posts);
  t.truthy(result.items[0].properties.content[0]);
});

test('Returns source (as mf2 object) for given URL', async t => {
  const result = await queryEndpoint(t.context.req({q: 'source', url: 'https://paulrobertlloyd.com/2018/11/warp_and_weft'}), t.context.posts);
  t.truthy(result.properties);
});

test('Returns source (name property) for given URL', async t => {
  const result = await queryEndpoint(t.context.req({q: 'source', url: 'https://paulrobertlloyd.com/2018/11/warp_and_weft', properties: 'name'}), t.context.posts);
  t.is(result.name[0], 'Warp and Weft');
});

test('Throws error if source URL cannot be found', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req({q: 'source', url: 'https://website.example'}), t.context.posts));
  t.regex(error.message, /^FetchError/);
});

test('Returns any available configuration value', async t => {
  const result1 = await queryEndpoint(t.context.req({q: 'categories'}), t.context.posts);
  const result2 = await queryEndpoint(t.context.req({q: 'post-types'}), t.context.posts);
  t.truthy(result1.categories);
  t.truthy(result2['post-types']);
});

test('Throws error if request is missing query string', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req(null), t.context.posts));
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Request is missing query string');
});

test('Throws error if unsupported query provided', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req({foo: 'bar'}), t.context.posts, t.context.config));
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Invalid query');
});

test('Throws error if unsupported parameter provided', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req({q: 'foo'}), t.context.posts, t.context.config));
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Invalid parameter: foo');
});
