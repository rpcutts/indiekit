const path = require('path');
const test = require('ava');
const {utils} = require('../.');

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

test('Removes `/` from beginning and end of string', t => {
  t.is(utils.normalizePath('/foo/bar/'), 'foo/bar');
});

test('Replaces entries of a property', t => {
  const obj = {
    content: ['hello world'],
    summary: ['used to illustrate the syntax of a programming language.']
  };
  const replacements = {
    content: ['hello moon']
  };
  const result = {
    content: ['hello moon'],
    summary: ['used to illustrate the syntax of a programming language.']
  };
  t.deepEqual(utils.replaceEntries(obj, replacements), result);
});

test('Replaces entries of a property, adding properties that don’t exist', t => {
  const obj = {
    content: ['hello world']
  };
  const replacements = {
    summary: ['used to illustrate the syntax of a programming language.']
  };
  const result = {
    content: ['hello world'],
    summary: ['used to illustrate the syntax of a programming language.']
  };
  t.deepEqual(utils.replaceEntries(obj, replacements), result);
});

test('Adds properties to an object', t => {
  const obj = {
    content: ['hello world']
  };
  const additions = {
    syndication: ['http://example.example']
  };
  const result = {
    content: ['hello world'],
    syndication: ['http://example.example']
  };
  t.deepEqual(utils.addProperties(obj, additions), result);
});

test('Adds properties to an existing object', t => {
  const obj = {
    content: ['hello world'],
    category: ['test1']
  };
  const additions = {
    category: ['test2']
  };
  const result = {
    content: ['hello world'],
    category: ['test1', 'test2']
  };
  t.deepEqual(utils.addProperties(obj, additions), result);
});

test('Deletes properties of an object', t => {
  const obj = {
    content: ['hello world'],
    summary: ['used to illustrate the syntax of a programming language.'],
    category: ['foo', 'bar']
  };
  const deletions = ['summary', 'category'];
  const result = {
    content: ['hello world']
  };
  t.deepEqual(utils.deleteProperties(obj, deletions), result);
});

test('Deletes entries of a property', t => {
  const obj = {
    content: ['hello world'],
    category: ['foo', 'bar']
  };
  const deletions = {
    category: ['foo']
  };
  const result = {
    content: ['hello world'],
    category: ['bar']
  };
  t.deepEqual(utils.deleteEntries(obj, deletions), result);
});

test('Deletes entries of a property, removing property if all entries removed', t => {
  const obj = {
    content: ['hello world'],
    category: ['foo', 'bar']
  };
  const deletions = {
    category: ['foo', 'bar']
  };
  const result = {
    content: ['hello world']
  };
  t.deepEqual(utils.deleteEntries(obj, deletions), result);
});

test('Throws error if deleted properties is not an array', t => {
  const obj = {
    content: ['hello world'],
    category: ['foo', 'bar']
  };
  const deletions = {
    category: 'foo'
  };
  const error = t.throws(() => {
    utils.deleteEntries(obj, deletions);
  });
  t.is(error.message, 'category should be an array');
});

test('Ignores properties that don’t exist in target object', t => {
  const obj = {
    content: ['hello world'],
    category: ['foo', 'bar']
  };
  const deletions = {
    content: ['hello world'],
    tags: ['foo', 'bar']
  };
  const result = {
    category: ['foo', 'bar']
  };
  t.deepEqual(utils.deleteEntries(obj, deletions), result);
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

test('Render a document which has YAML frontmatter and Nunjucks variables', t => {
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

test('Render Markdown string as HTML', t => {
  const block = utils.renderMarkdown('**bold**');
  const inline = utils.renderMarkdown('**bold**', 'inline');
  t.is(block, '<p><strong>bold</strong></p>\n');
  t.is(inline, '<strong>bold</strong>');
});
