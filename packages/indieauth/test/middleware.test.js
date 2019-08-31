require('dotenv').config();

const test = require('ava');
const sinon = require('sinon');
const {middleware} = require('../.');

const mockTokenRequest = (scope = 'create') => {
  const req = {};
  req.status = sinon.stub().returns(req);
  req.json = sinon.stub().returns(req);
  req.session = {
    indieauthToken: {scope}
  };
  return req;
};

test.beforeEach(t => {
  t.context.token = process.env.TEST_INDIEAUTH_TOKEN;
  t.context.url = process.env.INDIEKIT_URL;
});

test('Calls next() if required scope in access token', t => {
  // Setup
  const req = mockTokenRequest('create update');
  const res = null;
  const next = sinon.mock().once().withExactArgs().returns('Go to next');
  const result = middleware.checkScope('update')(req, res, next);

  // Test assertions
  t.is(result, 'Go to next');
});

test('Calls next() if required scope is `create` and access token provides `post`', t => {
  // Setup
  const req = mockTokenRequest('post');
  const res = null;
  const next = sinon.mock().once().withExactArgs().returns('Go to next');
  const result = middleware.checkScope('create')(req, res, next);

  // Test assertions
  t.is(result, 'Go to next');
});

test('Calls next() if required scope is `post` and access token provides `create`', t => {
  // Setup
  const req = mockTokenRequest('create');
  const res = null;
  const next = sinon.mock().once().withExactArgs().returns('Go to next');
  const result = middleware.checkScope('post')(req, res, next);

  // Test assertions
  t.is(result, 'Go to next');
});

test('Returns 401 if required scope not in access token', async t => {
  // Setup
  const req = mockTokenRequest('create');
  const res = null;
  const next = sinon.spy();
  await middleware.checkScope('update')(req, res, next);

  // Test assertions
  t.is(next.args[0][0].status, 401);
  t.is(next.args[0][0].name, 'Insufficient scope');
});

test('Returns 401 if required scope not provided', async t => {
  // Setup
  const req = mockTokenRequest('create');
  const res = null;
  const next = sinon.spy();
  await middleware.checkScope(null)(req, res, next);

  // Test assertions
  t.is(next.args[0][0].status, 400);
  t.is(next.args[0][0].name, 'Invalid request');
});

test('Authenticates using access token in `authorization` header', async t => {
  // Setup
  const req = {
    headers: {
      authorization: `Bearer ${t.context.token}`
    },
    session: {
      indieauthToken: {
        scope: 'create'
      }
    }
  };
  const res = null;
  const next = sinon.mock().once().withExactArgs().returns('Go to next');
  const result = await middleware.authorize(t.context.url)(req, res, next);

  // Test assertions
  t.is(result, 'Go to next');
  t.regex(String(req.session.indieauthToken.issued_at), /\d{10}/);
});

test('Authenticates using access token in `access_token` body', async t => {
  // Setup
  const req = {
    body: {
      access_token: t.context.token
    },
    session: {
      indieauthToken: {
        scope: 'create'
      }
    }
  };
  const res = null;
  const next = sinon.mock().once().withExactArgs().returns('Go to next');
  const result = await middleware.authorize(t.context.url)(req, res, next);

  // Test assertions
  t.is(result, 'Go to next');
  t.regex(String(req.session.indieauthToken.issued_at), /\d{10}/);
});

test('Returns 500 if publication URL not configured', async t => {
  // Setup
  const req = {
    headers: {
      authorization: `Bearer ${t.context.token}`
    },
    session: {
      indieauthToken: {
        scope: 'create'
      }
    }
  };
  const res = null;
  const next = sinon.spy();
  await middleware.authorize(null)(req, res, next);

  // Test assertions
  t.is(next.args[0][0].status, 500);
  t.is(next.args[0][0].name, 'Configuration error');
});

test('Returns 403 if publication URL doesn’t match that in token', async t => {
  // Setup
  const req = {
    headers: {
      authorization: `Bearer ${t.context.token}`
    },
    session: {
      indieauthToken: {
        scope: 'create'
      }
    }
  };
  const res = null;
  const next = sinon.spy();
  await middleware.authorize('https://foo.bar')(req, res, next);

  // Test assertions
  t.is(next.args[0][0].status, 403);
  t.is(next.args[0][0].name, 'Access denied');
});
