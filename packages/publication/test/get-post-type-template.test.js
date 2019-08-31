const test = require('ava');
const publication = require('../.');

test('Throws error if cached template not found', async t => {
  // Setup
  const postTypeConfig = {
    type: 'note',
    name: 'Note',
    template: {
      cacheKey: 'foo.njk'
    }
  };

  const error = await t.throwsAsync(publication.getPostTypeTemplate(postTypeConfig));

  // Test assertions
  t.is(error.message, 'Key `foo.njk` not found');
});
