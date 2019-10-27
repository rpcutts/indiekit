const os = require('os');
const path = require('path');
const nock = require('nock');
const test = require('ava');
const Publisher = require('@indiekit/publisher-github');

const pkg = require(process.env.PWD + '/package');
const utils = require('../.');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Adds data to an array, creating it if doesn’t exist.', t => {
  t.deepEqual(utils.addToArray(['foo', 'bar'], 'baz'), ['foo', 'bar', 'baz']);
});

test('Removes falsey values if provided object is an array', t => {
  // Setup
  const obj = [1, null, 2, undefined, 3, false, ''];
  const result = [1, 2, 3];

  // Test assertions
  t.deepEqual(utils.cleanArray(obj), result);
});

test('Recursively removes empty, null and falsy values from an object', t => {
  // Setup
  const obj = {
    array: [1, null, 2, undefined, 3, false],
    key: 'value',
    empty: '',
    true: true,
    false: false,
    null: null,
    undefined,
    object: {
      key: 'value',
      empty: '',
      true: true,
      false: false,
      null: null,
      undefined,
      nested: {
        key: 'value',
        empty: '',
        true: true,
        false: false,
        null: null,
        undefined
      }
    }
  };
  const result = {
    array: [1, 2, 3],
    key: 'value',
    true: true,
    object: {
      key: 'value',
      true: true,
      nested: {
        key: 'value',
        true: true
      }
    }
  };

  // Test assertions
  t.deepEqual(utils.cleanObject(obj), result);
});

test('Decodes form-encoded string', t => {
  t.false(utils.decodeFormEncodedString({foo: 'bar'}));
  t.is(utils.decodeFormEncodedString('foo+bar'), 'foo bar');
  t.is(utils.decodeFormEncodedString('http%3A%2F%2Ffoo.bar'), 'http://foo.bar');
});

test.only('Throws error if file can’t be fetched from GitHub', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('foo.txt'))
    .replyWithError('not found');

  // Setup
  const tmpdir = path.join(os.tmpdir(), pkg.name);
  const error = await t.throwsAsync(async () => {
    await utils.getData('foo.txt', tmpdir, github);
  });

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});

test('Renders a template string using context data', t => {
  const template = '{{ name }} walks into {{ location }}';
  const context = {
    name: 'Foo',
    location: 'Bar'
  };
  t.is(utils.render(template, context), 'Foo walks into Bar');
});

test('Renders a template string with a date using context data', t => {
  const template = 'Published {{ published | date(\'dd LLLL yyyy\') }}';
  const context = {
    name: 'Foo',
    published: '2019-02-27'
  };
  t.is(utils.render(template, context), 'Published 27 February 2019');
});

test('Throws error if required context data is missing', t => {
  const template = 'Published {{ published }}';
  const context = {
    name: 'Foo'
  };
  const error = t.throws(() => {
    utils.render()(template, context);
  });
  t.is(error.message, 'src must be a string or an object describing the source');
});

test('Renders a document which has YAML frontmatter and Nunjucks variables', t => {
  const file = path.join(__dirname, 'fixtures/document.md');
  const context = {
    name: 'Foo',
    location: 'Bar'
  };
  const result = utils.renderDocument(file, context);
  t.is(result.body, 'Foo walks into Bar\n');
  t.is(result.page.thingy, 'Whatsit');
  t.is(result.title, 'All about Foo');
});

test('Renders Markdown string as HTML', t => {
  const block = utils.renderMarkdown('**bold**');
  const inline = utils.renderMarkdown('**bold**', 'inline');
  t.is(block, '<p><strong>bold</strong></p>\n');
  t.is(inline, '<strong>bold</strong>');
});

test('Resolves a URL path to either named file, or index in named folder.', t => {
  const result = utils.resolveFilePath('path', 'html');
  t.is(result, 'path/index.html');
});
