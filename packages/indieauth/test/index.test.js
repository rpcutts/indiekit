const test = require('ava');

const IndieAuth = require('../.');

test.beforeEach(t => {
  t.context.opts = {
    token: {
      client_id: 'https://client.example/',
      scope: 'create update delete media',
      me: 'https://website.example'
    }
  };
});

test('Authorizes request', async t => {
  const req = {
    headers: {
      authorization: `Bearer ${t.context.opts.token}`
    }
  };
  const res = {};
  const next = () => {
    return true;
  };

  const authorization = new IndieAuth(t.context.opts).authorize(req, res, next);
  const result = await authorization;
  t.true(result);
});

test('Checks scope', t => {
  const result = new IndieAuth(t.context.opts).checkScope('post');
  t.true(result);
});
