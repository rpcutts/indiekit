const test = require('ava');

const queryMediaEndpoint = require('../../lib/query-media-endpoint');

const mediaStore = [{
  type: 'photo',
  path: 'foo.jpg',
  url: 'https://store.media.example/foo.jpg'
}, {
  type: 'audio',
  path: 'baz.mp3',
  url: 'https://store.media.example/baz.mp3'
}];

test.before(t => {
  t.context.req = query => {
    const req = {};
    req.query = query;
    return req;
  };
});

test('Returns URL of last uploaded file', t => {
  const result = queryMediaEndpoint(t.context.req({
    q: 'last'
  }), mediaStore);
  t.is(result.url, 'https://store.media.example/baz.mp3');
});

test('Returns empty object if no uploaded file records found', t => {
  const result = queryMediaEndpoint(t.context.req({
    q: 'last'
  }), null);
  t.deepEqual(result, {});
});

test('Throws error if request is missing query string', t => {
  const error = t.throws(() => {
    queryMediaEndpoint(t.context.req(null), mediaStore);
  });
  t.is(error.status, 400);
  t.is(error.message, 'Request is missing query string');
});

test('Throws error if unsupported query provided', t => {
  const error = t.throws(() => {
    queryMediaEndpoint(t.context.req({
      foo: 'bar'
    }), mediaStore);
  });
  t.is(error.status, 400);
  t.is(error.message, 'Invalid query');
});

test('Throws error if unsupported parameter provided', t => {
  const error = t.throws(() => {
    queryMediaEndpoint(t.context.req({
      q: 'foo'
    }), mediaStore);
  });
  t.is(error.status, 400);
  t.is(error.message, 'Invalid parameter: foo');
});
