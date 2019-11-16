require('dotenv').config();

const test = require('ava');
const request = require('supertest');

const app = request(require('../.'));

test('Application serves a favicon', async t => {
  const response = await app.get('/favicon.ico');

  t.is(response.status, 200);
  t.regex(response.header['content-type'], /^image/);
});

test('Application redirects to help page if not configured', async t => {
  const response = await app.get('/')
    .set('Accept', 'text/html');

  t.is(response.status, 302);
  t.regex(response.header['content-type'], /^text\/html/);
});

test('Application displays a documentation index', async t => {
  const response = await app.get('/docs/en');

  t.is(response.status, 200);
  t.regex(response.header['content-type'], /^text\/html/);
});

test('Application displays a documentation page', async t => {
  const response = await app.get('/docs/en/queries');

  t.is(response.status, 200);
  t.regex(response.header['content-type'], /^text\/html/);
});

test('Application responds to 404 error if documentation not found', async t => {
  const response = await app.get('/docs/en/404');

  t.is(response.status, 404);
});

// test('Application redirects to sign-in for pages requiring authentication', async t => {
//   const response = await app.get('/share');
//
//   t.is(response.status, 302);
//   t.is(response.text, 'Found. Redirecting to /sign-in?redirect=/share');
// });

test('Application responds to 404 error (with HTML if accepted)', async t => {
  const response = await app.get('/foobar')
    .set('Accept', 'text/html');

  t.is(response.status, 404);
  t.true(response.text.includes('<!DOCTYPE html>'));
  t.regex(response.header['content-type'], /^text\/html/);
});

test('Application responds to 404 error (with JSON if accepted)', async t => {
  const response = await app.get('/foobar')
    .set('Accept', 'application/json');

  t.is(response.status, 404);
  t.is(response.body.error, 'NotFoundError');
  t.regex(response.header['content-type'], /^application\/json/);
});

test('Application responds to 404 error (with plain text if accepted)', async t => {
  const response = await app.get('/foobar')
    .set('Accept', 'text/plain');

  t.is(response.status, 404);
  t.is(response.text, 'NotFoundError: The requested resource was not found');
  t.regex(response.header['content-type'], /^text\/plain/);
});
