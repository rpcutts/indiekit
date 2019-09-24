const test = require('ava');
const getPostTypes = require('../lib/get-post-types');

test('Returns array of post types if provided in object', async t => {
  const result = await getPostTypes({
    note: {
      type: 'note',
      name: 'Note'
    }
  });
  t.deepEqual(result, [{type: 'note', name: 'Note'}]);
});

test('Returns empty array if no post types provided', async t => {
  const result = await getPostTypes(null);
  t.deepEqual(result, []);
});
