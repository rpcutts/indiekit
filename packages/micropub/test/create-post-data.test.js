require('dotenv').config();

const Publication = require('@indiekit/publication');
const sinon = require('sinon');
const test = require('ava');
const validUrl = require('valid-url');

const pub = new Publication({
  defaults: require('@indiekit/config-jekyll'),
  endpointUrl: 'https://endpoint.example',
  me: process.env.INDIEKIT_URL
});

const createPostData = require('../lib/create-post-data');

test.beforeEach(async t => {
  t.context.req = () => {
    const req = {};
    req.body = {
      type: ['h-entry'],
      properties: {
        content: [{
          value: 'Watched Isle of Dogs. A fun yet timely story. An inventive example of stop-motion animation. A beautiful piece of graphic design. A work of art. A visual feast - with dogs!'
        }]
      }
    };
    req.is = sinon.stub().returns(req);
    req.session = sinon.stub().returns(req);
    req.status = sinon.stub().returns(req);
    req.json = sinon.stub().returns(req);
    return req;
  };

  t.context.config = await pub.getConfig();
});

test('Creates post data object', async t => {
  // Setup
  const req = await t.context.req();
  const postData = await createPostData(req, t.context.config);

  // Test assertions
  t.is(postData.type, 'note');
  t.regex(postData.path, /\b[\d\w]{5}\b/g);
  t.truthy(validUrl.isUri(postData.url));
  t.is(postData.mf2.type[0], 'h-entry');
  t.truthy(postData.mf2.properties);
});
