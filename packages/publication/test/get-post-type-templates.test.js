const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const test = require('ava');
const nock = require('nock');
const Publisher = require('@indiekit/publisher-github');

const pkg = require(process.env.PWD + '/package');

const publisher = new Publisher({
  token: 'abc123',
  user: 'user',
  repo: 'repo'
});

const getPostTypeTemplates = require('../lib/get-post-type-templates');

test('Updates `resolved` value to true', async t => {
  // Template
  const tmpdir = path.join(os.tmpdir(), pkg.name);
  const template = 'resolved-template.njk';
  const templatePath = path.join(tmpdir, template);

  // Mock request
  const scope = nock('https://api.github.com')
    .get(uri => uri.includes(template))
    .reply(200, {
      content: 'Zm9vYmFy'
    });

  // Setup result
  const configPostTypes = {
    note: {
      name: 'Foobar',
      template
    }
  };
  const opts = {
    tmpdir,
    publisher
  };
  const result = await getPostTypeTemplates(configPostTypes, opts);

  // Test assertions
  t.is(result.note.resolved, true);
  scope.done();

  // Clean up
  const savedTemplate = await fs.readFile(templatePath);
  if (savedTemplate) {
    fs.unlink(templatePath);
  }
});
