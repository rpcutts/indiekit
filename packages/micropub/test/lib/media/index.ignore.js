const defaults = require('@indiekit/config-jekyll');
const nock = require('nock');
const Publisher = require('@indiekit/publisher-github');
const test = require('ava');
const validUrl = require('valid-url');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

const {upload} = require('../../../lib/media')({
  config
  mediaStore,
  publisher: github
});

test.beforeEach(async t => {
  const photo = fs.readFileSync(path.resolve(__dirname, '../fixtures/photo.jpg'));
  t.context.file = {
    buffer: Buffer.from(photo),
    mimetype: 'image/jpg',
    originalname: 'photo.jpg'
  };
  t.context.req = () => {
    const req = {};
    req.session = sinon.stub().returns(req);
    return req;
  };

  t.context.media = [];
  t.context.config = {
    defaults,
    endpointUrl: 'https://endpoint.example',
    publisher: github,
    me: process.env.INDIEKIT_URL
  };
});

test('Uploads a media file', async t => {
  // Setup
  const scope = nock('https://api.github.com')
    .put(/\b[\d\w]{5}\b/g)
    .reply(200);
  const req = await t.context.req();
  const response = await upload(req, t.context.file, t.context.media, t.context.config);

  // Test assertions
  t.truthy(validUrl.isUri(response.location));
  scope.done();
});
