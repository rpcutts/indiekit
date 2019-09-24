const nock = require('nock');
const test = require('ava');
const defaults = require('@indiekit/config-jekyll');
const publisher = require('@indiekit/publisher-github');

const publication = require('../.');

test.serial('Returns default configuration if none provided', async t => {
  // Setup result
  const result = await publication.configure({defaults});

  // Test assertions
  t.log('result', result['post-types']);
  t.log('default', defaults['post-types']);
  t.deepEqual(result.config.categories, defaults.categories);
  t.deepEqual(result.config['syndicate-to'], defaults['syndicate-to']);
  t.deepEqual(result['post-types'], defaults['post-types']);
  t.deepEqual(result['slug-separator'], defaults['slug-separator']);
});

test('Merges publisher configuration with defaults', async t => {
  // Setup result
  const result = await publication.configure({
    config: {
      'slug-separator': 'foo'
    },
    defaults
  });

  // Test assertions
  t.is(result['slug-separator'], 'foo');
});

test('Merges remote publisher configuration file with defaults', async t => {
  // Mock request
  let content = {
    'slug-separator': 'foo'
  };
  content = JSON.stringify(content);
  content = Buffer.from(content).toString('base64');
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('config.json'))
    .reply(200, {
      content
    });

  // Setup result
  const result = await publication.configure({
    configPath: 'config.json',
    defaults,
    publisher
  });

  // Test assertions
  t.is(result['slug-separator'], 'foo');
  scope.done();
});

test('Throws error getting remote publisher configuration file', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('config.json'))
    .replyWithError('not found');

  // Setup result
  const error = await t.throwsAsync(publication.configure({
    configPath: 'config.json',
    defaults,
    publisher
  }));

  // Test assertions
  t.is(error.message, 'config.json could not be found in the cache or at the specified remote location');
  scope.done();
});

test('Merge publisher post types with defaults', async t => {
  // Setup result
  const result = await publication.configure({
    config: {
      'post-types': {
        note: {
          name: 'Foobar'
        }
      }
    },
    defaults
  });

  // Test assertions
  t.is(result['post-types'].note.name, 'Foobar');
});

test.serial('Throws error if `post-types` is not an object', async t => {
  // Setup error
  const error = await t.throwsAsync(publication.configure({
    config: {
      'post-types': [{
        type: 'note',
        name: 'foo'
      }, {
        type: 'article',
        name: 'bar'
      }]
    },
    defaults
  }));

  // Test assertions
  t.is(error.message, '`post-types` should be an object');
});

test('Throws error if post type value is not an object', async t => {
  // Setup error
  const error = await t.throwsAsync(publication.configure({
    config: {
      'post-types': {
        note: true
      }
    },
    defaults
  }));

  // Test assertions
  t.is(error.message, 'Post type should be an object');
});

test('Updates `template` value with cache key', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foobar.njk'))
    .reply(200, {
      content: 'Zm9vYmFy'
    });

  // Setup result
  const result = await publication.configure({
    config: {
      'post-types': {
        note: {
          name: 'Foobar',
          template: 'foobar.njk'
        }
      }
    },
    defaults,
    publisher
  });

  // Test assertions
  t.is(result['post-types'].note.template.cacheKey, 'foobar.njk');
  scope.done();
});
