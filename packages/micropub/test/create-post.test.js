require('dotenv').config();

const fsp = require('fs').promises;
const os = require('os');
const path = require('path');
const nock = require('nock');
const sinon = require('sinon');
const test = require('ava');
const validUrl = require('valid-url');
const defaults = require('@indiekit/config-jekyll');
const Publication = require('@indiekit/publication');
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

const {createPost} = require('../.');

test.before(t => {
  t.context.req = async config => {
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
        pub: await new Publication({
          config,
          defaults,
          endpointUrl: 'https://endpoint.example',
          publisher: github,
          url: process.env.INDIEKIT_URL
        }).getConfig()
      }
    };
    return req;
  };
});

test.serial('Creates a note post', async t => {
  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g)
    .reply(200);

  // Setup
  const req = await t.context.req();
  const created = await createPost(req);

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
  const req = await t.context.req();
  const error = await t.throwsAsync(createPost(req));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});

test.serial.skip('Gets new configured template (saving to file system)', async t => {
  const template = 'fetched-template.njk';
  const templatePath = path.join(os.tmpdir(), template);

  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes(template)) // Get template
    .reply(200, {
      content: 'Zm9vYmFy',
      sha: '\b[0-9a-f]{5,40}\b',
      name: 'foobar.njk'
    })
    .put(/[\d\w]{5}/g) // Save post
    .reply(200);

  // Setup
  const req = await t.context.req({
    'post-types': {
      note: {
        name: 'Foobar',
        template,
        post: {
          path: '_notes/{{ published | date(\'yyyy-MM-dd\') }}-{{ slug }}.md',
          url: 'notes/{{ published | date(\'yyyy/MM/dd\') }}/{{ slug }}'
        }
      }
    }
  });
  const created = await createPost(req);

  // Test assertions
  t.truthy(validUrl.isUri(created.url));
  scope.done();

  // Clean up
  const savedTemplate = await fsp.readFile(templatePath);
  if (savedTemplate) {
    fsp.unlink(templatePath);
  }
});

test.serial('Gets saved configured template (reading from file system)', async t => {
  const template = 'saved-template.njk';
  const templatePath = path.join(os.tmpdir(), template);
  fsp.writeFile(templatePath, 'foobar');

  // Mock request
  const scope = nock('https://api.github.com')
    .put(/[\d\w]{5}/g) // Save post
    .reply(200);

  // Setup
  const req = await t.context.req({
    'post-types': {
      note: {
        name: 'Foobar',
        template: templatePath,
        resolved: true,
        post: {
          path: '_notes/{{ published | date(\'yyyy-MM-dd\') }}-{{ slug }}.md',
          url: 'notes/{{ published | date(\'yyyy/MM/dd\') }}/{{ slug }}'
        }
      }
    }
  });
  const created = await createPost(req);

  // Test assertions
  t.truthy(validUrl.isUri(created.url));
  scope.done();

  // Clean up
  const savedTemplate = await fsp.readFile(templatePath);
  if (savedTemplate) {
    fsp.unlink(templatePath);
  }
});

test.serial.skip('Throws error getting configured template', async t => {
  const template = 'unfetched-template.njk';

  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes(template)) // Get template
    .replyWithError('not found');

  // Setup
  const req = await t.context.req({
    'post-types': {
      note: {
        name: 'Foobar',
        template,
        post: {
          path: '_notes/{{ published | date(\'yyyy-MM-dd\') }}-{{ slug }}.md',
          url: 'notes/{{ published | date(\'yyyy/MM/dd\') }}/{{ slug }}'
        }
      }
    }
  });
  const error = await t.throwsAsync(createPost(req));

  // Test assertions
  t.regex(error.message, /\bnot found\b/);
  scope.done();
});
