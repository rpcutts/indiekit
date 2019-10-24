const nock = require('nock');
const test = require('ava');
const Publisher = require('../.');

const gitlab = new Publisher({
  instance: 'https://gitlab.example',
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

test('Deletes a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .delete(uri => uri.includes('file.txt'))
    .reply(200);
  const response = await gitlab.deleteFile('file.txt', 'Message');

  // Test assertions
  t.truthy(response);
  scope.done();
});

test('Throws error deleting a file in a repository', async t => {
  // Setup
  const scope = nock('https://gitlab.example')
    .persist()
    .delete(uri => uri.includes('file.txt'))
    .replyWithError('not found');
  const error = await t.throwsAsync(gitlab.deleteFile('file.txt', 'Message'));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
