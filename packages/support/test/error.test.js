const test = require('ava');
const {ServerError} = require('../.');

test('Throws errror', t => {
  const fn = () => {
    throw new ServerError('Teapot', 418, 'I’m a teapot');
  };

  const error = t.throws(() => {
    fn();
  }, ServerError);

  t.is(error.name, 'Teapot');
  t.is(error.status, 418);
  t.is(error.message, 'I’m a teapot');
  t.is(error.uri, undefined);
});

test('Throws errror with URI', t => {
  const fn = () => {
    throw new ServerError('Teapot', 418, 'I’m a teapot', 'https://tools.ietf.org/html/rfc2324');
  };

  const error = t.throws(() => {
    fn();
  }, ServerError);

  t.is(error.name, 'Teapot');
  t.is(error.status, 418);
  t.is(error.message, 'I’m a teapot');
  t.is(error.uri, 'https://tools.ietf.org/html/rfc2324');
});
