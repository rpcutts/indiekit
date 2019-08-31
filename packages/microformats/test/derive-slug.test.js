const test = require('ava');
const {deriveSlug} = require('../.');

test('Derives slug from `mp-slug` property', t => {
  const provided = require('./fixtures/slug-provided');
  const slug = deriveSlug(provided, '-');
  t.is(slug[0], 'made-a-thing');
});

test('Derives slug, ignoring empty `mp-slug` property', t => {
  const providedEmpty = require('./fixtures/slug-provided-empty');
  const slug = deriveSlug(providedEmpty, '-');
  t.is(slug[0], 'made-a-thing-with-javascript');
});

test('Derives slug from `name` property', t => {
  const missing = require('./fixtures/slug-missing');
  const slug = deriveSlug(missing, '-');
  t.is(slug[0], 'made-a-thing-with-javascript');
});

test('Derives slug by generating random number', t => {
  const missingNoName = require('./fixtures/slug-missing-no-name');
  const slug = deriveSlug(missingNoName, '-');
  t.regex(slug[0], /[\d\w]{5}/g);
});
