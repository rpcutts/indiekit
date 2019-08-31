const publication = require('@indiekit/publication');
const test = require('ava');

const {queryEndpoint} = require('../.');

test.before(async t => {
  const pub = await publication.configure({
    defaults: require('@indiekit/config-jekyll'),
    endpointUrl: 'https://endpoint.example'
  });
  t.context.config = pub.config;
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
});

test('Returns publication configuration', async t => {
  const result = await queryEndpoint(t.context.req({q: 'config'}), t.context.posts, t.context.config);
  t.is(result['media-endpoint'], 'https://endpoint.example/media');
});

test('Returns publication categories', async t => {
  const result = await queryEndpoint(t.context.req({q: 'category'}), t.context.posts, t.context.config);
  t.deepEqual(result.categories, []);
});

test('Returns list of previously published posts', async t => {
  const result = await queryEndpoint(t.context.req({q: 'source'}), t.context.posts, t.context.config);
  t.truthy(result.items[0].properties.content[0]);
});

test('Returns source (as mf2 object) for given URL', async t => {
  const result = await queryEndpoint(t.context.req({q: 'source', url: 'https://paulrobertlloyd.com/2018/11/warp_and_weft'}), t.context.posts, t.context.config);
  t.truthy(result.properties);
});

test('Returns source (name property) for given URL', async t => {
  const result = await queryEndpoint(t.context.req({q: 'source', url: 'https://paulrobertlloyd.com/2018/11/warp_and_weft', properties: 'name'}), t.context.posts, t.context.config);
  t.is(result.name[0], 'Warp and Weft');
});

test('Throws error if source URL cannot be found', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req({q: 'source', url: 'https://website.example'}), t.context.posts, t.context.config));
  t.regex(error.message, /^FetchError/);
});

test('Returns any available configuration value', async t => {
  const result1 = await queryEndpoint(t.context.req({q: 'categories'}), t.context.posts, t.context.config);
  const result2 = await queryEndpoint(t.context.req({q: 'post-types'}), t.context.posts, t.context.config);
  t.truthy(result1.categories);
  t.truthy(result2['post-types']);
});

test('Throws error if configuration not available', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req({q: 'config'}), t.context.posts, null));
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Configuration not available');
});

test('Throws error if request is missing query string', async t => {
  const error = await t.throwsAsync(queryEndpoint(t.context.req(null), t.context.posts, t.context.config));
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
