const {client} = require('./../config/server');

// Default application settings
module.exports = (() => {
  const methods = {};

  methods.getAll = async () => {
    const publication = await client.hgetall('publication');
    return publication;
  };

  methods.get = async key => {
    const publication = await methods.getAll();
    return publication[key];
  };

  methods.setAll = values => {
    client.hmset('publication', values);
  };

  methods.set = (key, value) => {
    client.hset('publication', key, value);
  };

  return methods;
})();
