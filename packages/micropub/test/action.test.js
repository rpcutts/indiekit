require('dotenv').config();

const fs = require('fs');
const path = require('path');
const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

const pub = new Publication({
  defaults,
  endpointUrl: 'https://endpoint.example',
  publisher: github,
  url: process.env.INDIEKIT_URL
});

const {action} = require('../.');

test.before(t => {
  t.context.req = async file => {
    const req = {};
    req.body = {
      type: ['h-entry'],
      properties: {
        content: [{
          value: 'Watched Isle of Dogs. A fun yet timely story. An inventive example of stop-motion animation. A beautiful piece of graphic design. A work of art. A visual feast - with dogs!'
        }]
      }
    };
    req.files = file ? [{
      buffer: Buffer.from(file),
      mimetype: 'image/jpg',
      originalname: 'photo.jpg'
    }] : null;
    req.is = sinon.stub().returns(req);
    req.query = sinon.stub().returns(req);
    req.session = sinon.stub().returns(req);
    req.status = sinon.stub().returns(req);
    req.json = sinon.stub().returns(req);
    req.app = {
      locals: {
        pub: await pub.getConfig()
      }
    };
    return req;
  };
});

test.serial('Creates a post file', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(201);

  const req = await t.context.req();
  const result = await action(req);

  // Test assertions
  t.is(result.status, 202);
  t.is(result.success, 'create_pending');
  t.regex(result.location, /\b[\d\w]{5}\b/g);
  scope.done();
});

test.serial('Creates a post file with attachment', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(201)
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);

  // Setup
  const file = fs.readFileSync(path.resolve(__dirname, 'fixtures/photo.jpg'));
  const req = await t.context.req(file);
  const result = await action(req);

  // Test assertions
  t.is(result.status, 202);
  t.is(result.success, 'create_pending');
  t.regex(result.location, /\b[\d\w]{5}\b/g);
  scope.done();
});
