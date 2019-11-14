require('dotenv').config();
const sinon = require('sinon');
const test = require('ava');

const share = require('../../middleware/share');

test('Middleware renders share page', t => {
  const req = {
    method: 'GET',
    params: {
      path: 'share'
    },
    query: {
      content: 'Must come down.',
      name: 'What goes up…',
      url: 'https://website.example'
    }
  };
  const res = {
    render: sinon.stub()
  };
  const next = sinon.spy();
  share(req, res, next);

  t.true(res.render.calledOnce);
});

test.skip('Middleware posts to micropub endpoint', t => {
  const req = {
    body: {
      content: 'Must come down.',
      name: 'What goes up…',
      url: 'https://website.example'
    },
    headers: {
      host: 'endpoint.example'
    },
    method: 'POST',
    protocol: 'https'
  };
  const res = {
    redirect: sinon.spy()
  };
  const next = sinon.spy();
  share(req, res, next);

  t.log(res.redirect);
});

test.skip('Middleware throws to error middleware', t => {
  const req = {
    headers: {
      host: 'endpoint.example'
    },
    method: 'POST',
    protocol: 'https'
  };
  const res = {};
  const next = sinon.spy();
  share(req, res, next);

  t.log(next);
  t.true(next.calledOnce);
});
