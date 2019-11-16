const pkg = require(process.env.PWD + '/package');
const test = require('ava');

const rewiremock = require('../helpers/rewiremock');

const application = rewiremock.proxy(() => require('../../models/application'));

test('Gets all values from database', async t => {
  const result = await application.getAll();
  t.deepEqual(result, {
    name: 'IndieKit',
    description: pkg.description,
    repository: pkg.repository,
    version: pkg.version,
    configured: undefined,
    locale: 'en',
    publisherId: 'github',
    themeColor: '#0000ee'
  });
});

test('Gets a value from database', async t => {
  const result = await application.get('name');
  t.is(result, 'IndieKit');
});

test('Sets all values to database', async t => {
  await application.setAll({
    configured: true,
    locale: 'de',
    publisherId: 'gitlab',
    themeColor: '#ee0000'
  });
  const result = await application.getAll();
  t.deepEqual(result, {
    name: 'IndieKit',
    description: pkg.description,
    repository: pkg.repository,
    version: pkg.version,
    configured: 'true',
    locale: 'de',
    publisherId: 'gitlab',
    themeColor: '#ee0000'
  });
});

test('Sets a value to database', async t => {
  await application.set('locale', 'de');
  const result = await application.get('locale');

  t.is(result, 'de');
});
