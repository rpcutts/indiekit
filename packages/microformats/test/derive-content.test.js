const test = require('ava');
const {deriveContent} = require('../.');

test('Derives content from `content[0].html` property', t => {
  const providedHtmlValue = require('./fixtures/content-provided-html-value');
  const content = deriveContent(providedHtmlValue);
  t.is(content[0], '<p>Visit this <a href="https://example.com/">example website</a>.</p>');
});

test('Derives content from `content[0].html` property (ignores `content.value`)', t => {
  const providedHtml = require('./fixtures/content-provided-html');
  const content = deriveContent(providedHtml);
  t.is(content[0], '<p>Visit this <a href="https://example.com/">example website</a>.</p>');
});

test('Derives content from `content[0].value` property', t => {
  const providedValue = require('./fixtures/content-provided-value');
  const content = deriveContent(providedValue);
  t.is(content[0], 'Visit this example website.');
});

test('Derives content from `content[0]` property', t => {
  const provided = require('./fixtures/content-provided');
  const content = deriveContent(provided);
  t.is(content[0], 'Visit this example website.');
});

test('Returns null if no `content[0]` property found', t => {
  const missing = require('./fixtures/content-missing');
  const content = deriveContent(missing);
  t.is(content, null);
});
