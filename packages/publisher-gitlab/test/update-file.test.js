const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const gitlab = new Publisher({
  host: 'https://gitlab.example',
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Updates a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .put(uri => uri.includes('file.txt'))
    .reply(200, {
      file_path: 'file.txt',
      branch: 'master'
    });
  const response = await gitlab.updateFile('file.txt', 'Content', 'Message');

  // Test assertions
  t.truthy(response);
  t.is(response.file_path, 'file.txt');
  t.is(response.branch, 'master');
  scope.done();
});

test('Throws error updating a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .persist()
    .put(uri => uri.includes('file.txt'))
    .replyWithError('not found');
  const error = await t.throwsAsync(gitlab.updateFile('file.txt', 'Content', 'Message'));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
