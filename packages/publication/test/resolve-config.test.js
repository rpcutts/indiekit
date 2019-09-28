const fsp = require('fs').promises;
const path = require('path');
const os = require('os');
const nock = require('nock');
const test = require('ava');
const defaults = require('@indiekit/config-jekyll');
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

const Publication = require('../.');

test.serial('Returns default configuration vales if none provided by publication', async t => {
  // Setup result
  const pub = new Publication({defaults});
  const result = await pub.getConfig();

  // Test assertions
  t.deepEqual(result.categories, defaults.categories);
  t.false(result['media-endpoint']);
  t.deepEqual(result['post-types'][0].name, defaults['post-types'].article.name);
  t.deepEqual(result['post-type-config'].article.name, defaults['post-types'].article.name);
  t.falsy(result.publisher);
  t.deepEqual(result['syndicate-to'], defaults['syndicate-to']);
  t.deepEqual(result['slug-separator'], defaults['slug-separator']);
  t.falsy(result.url);
});

test('Merges publisher configuration with defaults', async t => {
  // Setup result
  const publication = new Publication({
    config: {
      'slug-separator': 'foo'
    },
    defaults
  });
  const result = await publication.getConfig();

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
  const pub = new Publication({
    configPath: 'config.json',
    defaults,
    publisher: github
  });
  const result = await pub.getConfig();

  // Test assertions
  t.is(result['slug-separator'], 'foo');
  scope.done();
});

test('Throws error getting remote publisher configuration file', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('unfetched-config.json'))
    .replyWithError('not found');

  // Setup result
  const pub = new Publication({
    configPath: 'unfetched-config.json',
    defaults,
    publisher: github
  });

  const error = await t.throwsAsync(pub.getConfig());

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});

test('Merge publisher post types with defaults', async t => {
  // Setup result
  const pub = new Publication({
    config: {
      'post-types': {
        note: {
          name: 'Foobar'
        }
      }
    },
    defaults
  });
  const result = await pub.getConfig();

  // Test assertions
  t.is(result['post-type-config'].note.name, 'Foobar');
});

test('Throws error if `post-types` is not an object', async t => {
  // Setup error
  const pub = new Publication({
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
  });
  const error = await t.throwsAsync(pub.getConfig());

  // Test assertions
  t.is(error.message, '`post-types` should be an object');
});

test.skip('Updates `resolved` value to true', async t => {
  const template = 'resolved-template.njk';
  const templatePath = path.join(os.tmpdir(), template);

  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes(template))
    .reply(200, {
      content: 'Zm9vYmFy'
    });

  // Setup result
  const pub = new Publication({
    config: {
      'post-types': {
        note: {
          name: 'Foobar',
          template
        }
      }
    },
    defaults,
    publisher: github
  });
  const result = await pub.getConfig();

  // Test assertions
  t.is(result['post-type-config'].note.resolved, true);
  scope.done();

  // Clean up
  const savedTemplate = await fsp.readFile(templatePath);
  if (savedTemplate) {
    fsp.unlink(templatePath);
  }
});
