/* eslint-disable camelcase */

const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const gitlab = new Publisher({
  host: 'https://gitlab.example',
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Reads a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .get(uri => uri.includes('file.txt'))
    .reply(200, {
      content: 'Zm9vYmFy',
      commit_id: '\b[0-9a-f]{5,40}\b',
      file_name: 'file.txt'
    });
  const response = await gitlab.readFile('file.txt');

  // Test assertions
  t.is(response, 'foobar');
  scope.done();
});

test('Throws error reading a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .persist()
    .get(uri => uri.includes('file.txt'))
    .replyWithError('not found');
  const error = await t.throwsAsync(gitlab.readFile('file.txt'));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
