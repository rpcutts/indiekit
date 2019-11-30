require('dotenv').config();
const sinon = require('sinon');
const test = require('ava');

const authenticate = require('../../middleware/auth');

test('Middleware proceeds to next middleware', t => {
  const req = {
    session: {
      me: process.env.INDIEKIT_URL
    }
  };
  const res = {
    redirect: sinon.stub()
  };
  const next = sinon.spy();
  authenticate(req, res, next);

  t.true(next.calledOnce);
});

test('Middleware redirects to sign in page', t => {
  const req = {};
  const res = {
    redirect: sinon.spy()
  };
  const next = sinon.stub();
  authenticate(req, res, next);

  t.true(res.redirect.calledOnce);
});
