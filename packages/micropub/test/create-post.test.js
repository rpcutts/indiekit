const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
const validUrl = require('valid-url');
const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const publisher = require('@indiekit/publisher-github');
const {cache} = require('@indiekit/support');

const {createPost} = require('../.');

const mockRequest = config => {
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
  req.app = {
    locals: {
      pub: new Publication({
        config,
        defaults,
        endpointUrl: 'https://endpoint.example',
        publisher,
        url: process.env.INDIEKIT_URL
      })
    }
  };
  return req;
};

test.serial('Creates a note post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .reply(200);

  // Setup
  const created = await createPost(mockRequest());

  // Test assertions
  t.truthy(validUrl.isUri(created.url));
  scope.done();
});

test.serial('Throws publisher error creating a post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .replyWithError('not found');

  // Setup
  const error = await t.throwsAsync(createPost(mockRequest()));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});

test.serial('Gets configured template from cache', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .reply(200);

  // Setup
  cache.set('foobar.njk', 'foobar');
  const postTypes = {
    note: {
      name: 'Foobar',
      template: {
        cacheKey: 'foobar.njk'
      },
      post: {
        path: '_notes/{{ published | date(\'yyyy-MM-dd\') }}-{{ slug }}.md',
        url: 'notes/{{ published | date(\'yyyy/MM/dd\') }}/{{ slug }}'
      }
    }
  };
  const created = await createPost(mockRequest(postTypes));

  // Test assertions
  t.truthy(validUrl.isUri(created.url));
  scope.done();
});

test.serial('Throws error getting configured template', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .replyWithError('not found');

  // Setup
  const config = {
    'post-types': {
      note: {
        name: 'Foobar',
        template: 'foobar.njk',
        post: {
          path: '_notes/{{ published | date(\'yyyy-MM-dd\') }}-{{ slug }}.md',
          url: 'notes/{{ published | date(\'yyyy/MM/dd\') }}/{{ slug }}'
        }
      }
    }
  };
  const error = await t.throwsAsync(createPost(mockRequest(config)));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});

test.serial('Throws error if `template.cacheKey` value is invalid', async t => {
  // Setup
  const config = {
    'post-types': {
      note: {
        name: 'Foobar',
        template: {
          cacheKey: null
        },
        post: {
          path: '_notes/{{ published | date(\'yyyy-MM-dd\') }}-{{ slug }}.md',
          url: 'notes/{{ published | date(\'yyyy/MM/dd\') }}/{{ slug }}'
        }
      }
    }
  };
  const error = await t.throwsAsync(createPost(mockRequest(config)));

  // Test assertions
  t.is(error.message, 'The "path" argument must be one of type string, Buffer, or URL. Received type object');
});
