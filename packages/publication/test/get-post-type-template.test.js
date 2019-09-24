const test = require('ava');
const defaults = require('@indiekit/config-jekyll');

const Publication = require('../.');

test('Throws error if cached template not found', async t => {
  // Setup
  const pub = new Publication({defaults});
  const postTypeConfig = {
    type: 'note',
    name: 'Note',
    template: {
      cacheKey: 'foo.njk'
    }
  };

  const error = await t.throwsAsync(pub.getPostTypeTemplate(postTypeConfig));

  // Test assertions
  t.is(error.message, 'Key `foo.njk` not found');
});
