const nock = require('nock');
const test = require('ava');
const request = require('supertest');

const app = request(require('@indiekit/app'));

test.beforeEach(t => {
  t.context.token = process.env.TEST_INDIEAUTH_TOKEN;
  t.context.badToken = process.env.TEST_INDIEAUTH_TOKEN_NOSCOPE;
  t.context.postUrl = `${process.env.INDIEKIT_URL}/notes/2019/08/17/baz`;
});

// Delete post
test('Deletes a post', async t => {
  // Mock GitHub delete file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b'
    })
    .delete(uri => uri.includes('baz.md'))
    .reply(200, {
      content: null,
      commit: {
        message: 'Delete message'
      }
    });

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'delete',
      url: t.context.postUrl
    });

  // Test assertions
  t.is(response.status, 200);
  t.is(response.body.success, 'delete');
  scope.done();
});
