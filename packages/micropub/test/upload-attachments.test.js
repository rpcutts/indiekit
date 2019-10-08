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

const {uploadAttachments} = require('../.');

test.before(t => {
  const photo = fs.readFileSync(path.resolve(__dirname, 'fixtures/photo.jpg'));
  t.context.media = [];
  t.context.req = async () => {
    const req = {};
    req.session = sinon.stub().returns(req);
    req.app = {
      locals: {
        pub: await pub.getConfig()
      }
    };
    req.files = [{
      buffer: Buffer.from(photo),
      mimetype: 'image/jpg',
      originalname: 'photo.jpg'
    }];
    return req;
  };
});

test('Uploads an attachment', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);
  const req = await t.context.req();
  const result = await uploadAttachments(req, t.context.media);

  // Test assertions
  t.is(result[0].type, 'photo');
  scope.done();
});
