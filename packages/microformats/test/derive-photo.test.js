const test = require('ava');
const {derivePhoto} = require('../.');

test('Derives photo from `photo` property', async t => {
  const provided = require('./fixtures/photo-provided');
  const photo = await derivePhoto(provided);
  t.is(photo[0].value, 'sunset.jpg');
});

test('Derives photo from `photo.value` property', async t => {
  const providedValue = require('./fixtures/photo-provided-value');
  const photo = await derivePhoto(providedValue);
  t.is(photo[0].value, 'sunset.jpg');
});

test('Derives photos from `photo` properties', async t => {
  const multipleProvided = require('./fixtures/photo-multiple-provided');
  const photos = await derivePhoto(multipleProvided);
  const result = [{value: 'sunrise.jpg'}, {value: 'sunset.jpg'}];
  t.deepEqual(photos, result);
});

test('Derives photos from `photo.value` properties', async t => {
  const multipleProvidedValue = require('./fixtures/photo-multiple-provided-value');
  const photos = await derivePhoto(multipleProvidedValue);
  const result = [{value: 'sunrise.jpg'}, {value: 'sunset.jpg'}];
  t.deepEqual(photos, result);
});
