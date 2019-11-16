const fs = require('fs');
const path = require('path');
const nock = require('nock');
const test = require('ava');
const {urlToMf2} = require('../.');

test('Throws error if no response from URL', async t => {
  // Mock request
  const scope = nock('https://website.example')
    .get('/')
    .replyWithError('not found');

  // Setup
  const error = await t.throwsAsync(urlToMf2('https://website.example'));

  // Test assertions
  t.is(error.message, 'not found');
  scope.done();
});

test('Throws error if URL has no items', async t => {
  // Mock request
  const file = path.resolve(__dirname, 'fixtures/html-items-none.html');
  const html = fs.readFileSync(file, 'utf-8');
  const scope = nock('https://website.example')
    .get('/')
    .reply(200, html);

  // Setup
  const error = await t.throwsAsync(urlToMf2('https://website.example'));

  // Test assertions
  t.is(error.message, 'Page has no items');
  scope.done();
});

test('Returns empty object if requested property not found', async t => {
  // Mock request
  const file = path.resolve(__dirname, 'fixtures/html-items-one.html');
  const html = fs.readFileSync(file, 'utf-8');
  const scope = nock('https://website.example')
    .get('/notes/12345')
    .reply(200, html);

  // Setup
  const mf2 = await urlToMf2('https://website.example/notes/12345', 'location');

  // Test assertions
  t.deepEqual(mf2, {});
  scope.done();
});

test('Returns requested property', async t => {
  // Mock request
  const file = path.resolve(__dirname, 'fixtures/html-items-one.html');
  const html = fs.readFileSync(file, 'utf-8');
  const scope = nock('https://website.example')
    .get('/notes/12345')
    .reply(200, html);

  // Setup
  const mf2 = await urlToMf2('https://website.example/notes/12345', 'name');

  // Test assertions
  t.deepEqual(mf2, {
    name: ['I ate a cheese sandwich.']
  });
  scope.done();
});
