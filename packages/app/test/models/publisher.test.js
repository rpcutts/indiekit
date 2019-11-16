const test = require('ava');

const rewiremock = require('../helpers/rewiremock');

const publisher = rewiremock.proxy(() => require('../../models/publisher'));

test('Gets all values from database', async t => {
  const result = await publisher('github').getAll();
  t.deepEqual(result, {});
});

test('Gets a value from database', async t => {
  const result = await publisher('github').get('configPath');
  t.falsy(result);
});

test('Sets all values to database', async t => {
  await publisher('github').setAll({
    token: 'abc123',
    user: 'user',
    repo: 'repo'
  });
  const result = await publisher('github').getAll();
  t.deepEqual(result, {
    token: 'abc123',
    user: 'user',
    repo: 'repo'
  });
});

test('Sets a value to database', async t => {
  await publisher('github').set('token', 'abc123');
  const result = await publisher('github').get('token');

  t.is(result, 'abc123');
});
