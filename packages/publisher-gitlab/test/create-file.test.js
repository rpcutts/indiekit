const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const gitlab = new Publisher({
  instance: 'https://gitlab.example',
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Creates a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .post(uri => uri.includes('file.txt'))
    .reply(200, {
      file_path: 'file.txt',
      branch: 'master'
    });
  const response = await gitlab.createFile('file.txt', 'Content', 'Message');

  // Test assertions
  t.truthy(response);
  t.is(response.file_path, 'file.txt');
  t.is(response.branch, 'master');
  scope.done();
});

test('Throws error creating a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .post(uri => uri.includes('file.txt'))
    .replyWithError('not found');
  const error = await t.throwsAsync(gitlab.createFile('file.txt', 'Content', 'Message'));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
