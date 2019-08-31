const test = require('ava');

const {queryEndpoint} = require('../../.').media;

test.before(t => {
  t.context.media = [{
    type: 'photo',
    path: 'foo.jpg',
    url: 'https://store.media.example/foo.jpg'
  }, {
    type: 'audio',
    path: 'baz.mp3',
    url: 'https://store.media.example/baz.mp3'
  }];
  t.context.req = query => {
    const req = {};
    req.query = query;
    return req;
  };
});

test('Returns URL of last uploaded file', t => {
  const result = queryEndpoint(t.context.req({q: 'last'}), t.context.media);
  t.is(result.url, 'https://store.media.example/baz.mp3');
});

test('Returns empty object if no uploaded file records found', t => {
  const result = queryEndpoint(t.context.req({q: 'last'}), null);
  t.deepEqual(result, {});
});

test('Throws error if request is missing query string', t => {
  const error = t.throws(() => {
    queryEndpoint(t.context.req(null), t.context.media);
  });
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Request is missing query string');
});

test('Throws error if unsupported query provided', t => {
  const error = t.throws(() => {
    queryEndpoint(t.context.req({foo: 'bar'}), t.context.media);
  });
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Invalid query');
});

test('Throws error if unsupported parameter provided', t => {
  const error = t.throws(() => {
    queryEndpoint(t.context.req({q: 'foo'}), t.context.media);
  });
  t.is(error.name, 'Invalid request');
  t.is(error.message, 'Invalid parameter: foo');
});
