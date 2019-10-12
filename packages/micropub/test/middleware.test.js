const nock = require('nock');
const test = require('ava');
const request = require('supertest');

const app = request(require('@indiekit/app'));

test.beforeEach(t => {
  t.context.token = process.env.TEST_INDIEAUTH_TOKEN;
  t.context.badToken = process.env.TEST_INDIEAUTH_TOKEN_NOSCOPE;
  t.context.postUrl = `${process.env.INDIEKIT_URL}/notes/2019/08/17/baz`;
});

// Query
test('Responds to endpoint query', async t => {
  const response = await app.get('/micropub')
    .set('Accept', 'application/json')
    .query({q: 'config'});
  t.is(response.status, 200);
  t.truthy(response.body['media-endpoint']);
});

test('Returns 400 in response to unknown endpoint query', async t => {
  const response = await app.get('/micropub')
    .set('Accept', 'application/json')
    .query({q: 'foo'});
  t.is(response.status, 400);
  t.is(response.body.error_description, 'Invalid parameter: foo');
});

test('Returns 401 if token missing required scope', async t => {
  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.badToken}`)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
    .send('h=entry&content=Creates+a+post+file');

  // Test assertions
  t.is(response.status, 401);
  t.is(response.body.error_description, 'No scope(s) provided by access token');
});

test.skip('Returns 202 and location of created post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(201);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
    .send('h=entry&content=Creates+a+post+file');

  // Test assertions
  t.is(response.status, 202);
  t.is(response.body.success, 'create_pending');
  t.regex(response.header.location, /\b[\d\w]{5}\b/g);
  scope.done();
});

test.serial.skip('Returns 500 if problem creating post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .replyWithError('not found');

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
    .send('h=entry&content=Throws+error+if+GitHub+responds+with+an+error');

  // Test assertions
  t.is(response.status, 500);
  t.regex(response.body.error_description, /\bnot found\b/);
  scope.done();
});

test.skip('Returns 404 if no post records found to perform delete action', async t => {
  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'delete',
      url: t.context.postUrl
    });

  // Test assertions
  t.is(response.status, 404);
  t.is(response.body.error_description, 'Can’t delete post. No records found');
});

test.skip('Returns 404 if no post records found to perform update action', async t => {
  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      replace: {
        content: ['hello moon']
      }
    });

  // Test assertions
  t.is(response.status, 404);
  t.is(response.body.error_description, 'Can’t update post. No records found');
});

// Delete post
test.serial.skip('Deletes a post', async t => {
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

test.serial.skip('Returns 500 if problem deleting post', async t => {
  // Mock GitHub delete file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .replyWithError('not found');

  // Setup
  // store.set(t.context.postUrl, t.context.postData);
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'delete',
      url: t.context.postUrl
    });

  // Test assertions
  t.is(response.status, 500);
  t.regex(response.body.error_description, /\bnot found\b/);
  scope.done();
});

// Undelete post
test.serial.skip('Undeletes a post', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .put(uri => uri.includes('baz.md'))
    .reply(200);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'undelete',
      url: t.context.postUrl
    });

  // Test assertions
  t.is(response.status, 200);
  t.is(response.body.success, 'delete_undelete');
  scope.done();
});

test.serial.skip('Returns 500 if problem undeleting post', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .put(uri => uri.includes('baz.md'))
    .replyWithError('not found');

  // Setup
  // store.set(t.context.postUrl, t.context.postData);
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'undelete',
      url: t.context.postUrl
    });

  // Test assertions
  t.is(response.status, 500);
  t.regex(response.body.error_description, /\bnot found\b/);
  scope.done();
});

// Update post
test.serial.skip('Updates a post by replacing its content', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy'
    })
    .put(uri => uri.includes('baz.md'))
    .reply(200);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      replace: {
        content: ['hello moon']
      }
    });

  // Test assertions
  t.is(response.status, 200);
  t.is(response.body.success, 'update');
  scope.done();
});

test.serial.skip('Updates a post by adding a syndication value', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy'
    })
    .put(uri => uri.includes('baz.md'))
    .reply(200);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      add: {
        syndication: ['http://web.archive.org/web/20190818120000/https://foo.bar/baz']
      }
    });

  // Test assertions
  t.is(response.status, 200);
  t.is(response.body.success, 'update');
  scope.done();
});

test.serial.skip('Updates a post by deleting a property', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy'
    })
    .put(uri => uri.includes('baz.md'))
    .reply(200);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      delete: ['category']
    });

  // Test assertions
  t.is(response.status, 200);
  t.is(response.body.success, 'update');
  scope.done();
});

test.serial.skip('Updates a post by deleting an entry in a property', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy'
    })
    .put(uri => uri.includes('baz.md'))
    .reply(200);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      delete: {
        category: ['foo']
      }
    });

  // Test assertions
  t.is(response.status, 200);
  t.is(response.body.success, 'update');
  scope.done();
});

test.serial.skip('Returns 201 if updating property causes URL to change', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('new_slug.md'))
    .reply(404)
    .put(uri => uri.includes('new_slug.md'))
    .reply(200);

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      replace: {
        slug: ['new_slug']
      }
    });

  // Test assertions
  t.is(response.status, 201);
  t.regex(response.header.location, /\bnew_slug\b/g);
  t.is(response.body.success, 'update');
  scope.done();
});

test.serial.skip('Returns 500 if problem updating post', async t => {
  // Mock GitHub create file request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes('baz.md'))
    .reply(200, {
      content: 'Zm9vYmFy'
    })
    .put(uri => uri.includes('baz.md'))
    .replyWithError('not found');

  // Setup
  const response = await app.post('/micropub')
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${t.context.token}`)
    .send({
      action: 'update',
      url: t.context.postUrl,
      replace: {
        content: ['hello moon']
      }
    });

  // Test assertions
  t.is(response.status, 500);
  t.regex(response.body.error_description, /\bnot found\b/);
  scope.done();
});
