const test = require('ava');

const update = require('../../lib/utils/update');

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
  t.deepEqual(update.addProperties(obj, additions), result);
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
  t.deepEqual(update.addProperties(obj, additions), result);
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
  t.deepEqual(update.deleteEntries(obj, deletions), result);
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
  t.deepEqual(update.deleteEntries(obj, deletions), result);
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
    update.deleteEntries(obj, deletions);
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
  t.deepEqual(update.deleteEntries(obj, deletions), result);
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
  t.deepEqual(update.deleteProperties(obj, deletions), result);
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
  t.deepEqual(update.replaceEntries(obj, replacements), result);
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
  t.deepEqual(update.replaceEntries(obj, replacements), result);
});
