const fs = require('fs');
const path = require('path');
const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
const publisher = require('@indiekit/publisher-github');
const config = require('@indiekit/config-jekyll');

const {uploadAttachments} = require('../.');

test.before(t => {
  const image = fs.readFileSync(path.resolve(__dirname, 'fixtures/image.gif'));
  t.context.media = [];
  t.context.req = () => {
    const req = {};
    req.session = sinon.stub().returns(req);
    req.app = {locals: {pub: {
      publisher,
      'post-types': config['post-types'],
      url: process.env.INDIEKIT_URL
    }}};
    req.files = [{
      buffer: Buffer.from(image),
      mimetype: 'image/gif',
      originalname: 'image.gif'
    }];
    return req;
  };
});

test('Uploads an attachment', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);
  const result = await uploadAttachments(t.context.req(), t.context.media);

  // Test assertions
  t.is(result[0].type, 'photo');
  scope.done();
});
