const fs = require('fs');
const path = require('path');
const test = require('ava');
const {DateTime} = require('luxon');

const derive = require('../../lib/utils/derive');

test('Derives content from `content[0].html` property', t => {
  const providedHtmlValue = require('./../fixtures/content-provided-html-value');
  const content = derive.content(providedHtmlValue);
  t.is(content[0], '<p>Visit this <a href="https://example.com/">example website</a>.</p>');
});

test('Derives content from `content[0].html` property (ignores `content.value`)', t => {
  const providedHtml = require('./../fixtures/content-provided-html');
  const content = derive.content(providedHtml);
  t.is(content[0], '<p>Visit this <a href="https://example.com/">example website</a>.</p>');
});

test('Derives content from `content[0].value` property', t => {
  const providedValue = require('./../fixtures/content-provided-value');
  const content = derive.content(providedValue);
  t.is(content[0], 'Visit this example website.');
});

test('Derives content from `content[0]` property', t => {
  const provided = require('./../fixtures/content-provided');
  const content = derive.content(provided);
  t.is(content[0], 'Visit this example website.');
});

test('Returns null if no `content[0]` property found', t => {
  const missing = require('./../fixtures/content-missing');
  const content = derive.content(missing);
  t.is(content, null);
});

test('Derives file data', async t => {
  // Setup
  let file = {
    buffer: await fs.readFileSync(path.resolve(__dirname, './../fixtures/photo.jpg')),
    originalname: 'photo.jpg'
  };
  file = derive.fileData(file);

  // Test assertions
  t.is(file.originalname, 'photo.jpg');
  t.truthy(DateTime.fromISO(file.filedate.isValid));
  t.regex(file.filename, /[\d\w]{5}.jpg/g);
  t.is(file.fileext, 'jpg');
});

test('Derives a permalink', t => {
  t.is(derive.permalink('http://foo.bar', 'baz'), 'http://foo.bar/baz');
  t.is(derive.permalink('http://foo.bar/', '/baz'), 'http://foo.bar/baz');
  t.is(derive.permalink('http://foo.bar/baz', '/qux/quux'), 'http://foo.bar/baz/qux/quux');
  t.is(derive.permalink('http://foo.bar/baz/', '/qux/quux'), 'http://foo.bar/baz/qux/quux');
});

test('Derives photo from `photo` property', async t => {
  const provided = require('./../fixtures/photo-provided');
  const photo = await derive.photo(provided);
  t.is(photo[0].value, 'sunset.jpg');
});

test('Derives photo from `photo.value` property', async t => {
  const providedValue = require('./../fixtures/photo-provided-value');
  const photo = await derive.photo(providedValue);
  t.is(photo[0].value, 'sunset.jpg');
});

test('Derives photos from `photo` properties', async t => {
  const multipleProvided = require('./../fixtures/photo-multiple-provided');
  const photos = await derive.photo(multipleProvided);
  const result = [{value: 'sunrise.jpg'}, {value: 'sunset.jpg'}];
  t.deepEqual(photos, result);
});

test('Derives photos from `photo.value` properties', async t => {
  const multipleProvidedValue = require('./../fixtures/photo-multiple-provided-value');
  const photos = await derive.photo(multipleProvidedValue);
  const result = [{value: 'sunrise.jpg'}, {value: 'sunset.jpg'}];
  t.deepEqual(photos, result);
});

test('Derives date from `published` property', t => {
  const provided = require('./../fixtures/published-provided');
  const published = derive.published(provided);
  t.is(published[0], '2019-01-02T03:04:05.678Z');
});

test('Derives date from `published` property with short date', t => {
  const providedShortDate = require('./../fixtures/published-provided-short-date');
  const published = derive.published(providedShortDate);
  t.is(published[0], '2019-01-02T00:00:00.000Z');
});

test('Derives date by using current date', t => {
  const missing = require('./../fixtures/published-missing');
  const published = derive.published(missing);
  t.true(DateTime.fromISO(published[0]).isValid);
});

test('Derives slug from `mp-slug` property', t => {
  const provided = require('./../fixtures/slug-provided');
  const slug = derive.slug(provided, '-');
  t.is(slug[0], 'made-a-thing');
});

test('Derives slug, ignoring empty `mp-slug` property', t => {
  const providedEmpty = require('./../fixtures/slug-provided-empty');
  const slug = derive.slug(providedEmpty, '-');
  t.is(slug[0], 'made-a-thing-with-javascript');
});

test('Derives slug from `name` property', t => {
  const missing = require('./../fixtures/slug-missing');
  const slug = derive.slug(missing, '-');
  t.is(slug[0], 'made-a-thing-with-javascript');
});

test('Derives slug by generating random number', t => {
  const missingNoName = require('./../fixtures/slug-missing-no-name');
  const slug = derive.slug(missingNoName, '-');
  t.regex(slug[0], /[\d\w]{5}/g);
});

test('Derives file type and returns equivalent IndieWeb post type', async t => {
  // Setup
  const audio = {
    buffer: await fs.readFileSync(path.resolve(__dirname, './../fixtures/audio.mp3'))
  };
  const photo = {
    buffer: await fs.readFileSync(path.resolve(__dirname, './../fixtures/photo.jpg'))
  };
  const video = {
    buffer: await fs.readFileSync(path.resolve(__dirname, './../fixtures/video.mp4'))
  };
  const font = {
    buffer: await fs.readFileSync(path.resolve(__dirname, './../fixtures/font.ttf'))
  };

  // Test assertions
  t.is(derive.mediaType(audio), 'audio');
  t.is(derive.mediaType(photo), 'photo');
  t.is(derive.mediaType(video), 'video');
  t.is(derive.mediaType(font), null);
});
