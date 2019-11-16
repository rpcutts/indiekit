const test = require('ava');

const rewiremock = require('../helpers/rewiremock');

const publication = rewiremock.proxy(() => require('../../models/publication'));

test('Gets all values from database', async t => {
  const result = await publication.getAll();
  t.deepEqual(result, {});
});

test('Gets a value from database', async t => {
  const result = await publication.get('configPath');
  t.falsy(result);
});

test('Sets all values to database', async t => {
  await publication.setAll({
    me: 'https://website.example',
    configPath: 'etc/indiekit.json'
  });
  const result = await publication.getAll();
  t.deepEqual(result, {
    me: 'https://website.example',
    configPath: 'etc/indiekit.json'
  });
});

test('Sets a value to database', async t => {
  await publication.set('configPath', 'etc/indiekit.json');
  const result = await publication.get('configPath');

  t.is(result, 'etc/indiekit.json');
});
