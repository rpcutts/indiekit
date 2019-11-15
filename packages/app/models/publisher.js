const {client} = require('./../config/server');

// Default application settings
module.exports = publisherId => {
  const methods = {};

  methods.getAll = async () => {
    const publisher = await client.hgetall(publisherId);
    return publisher;
  };

  methods.get = async key => {
    const publisher = await methods.getAll();
    return publisher[key];
  };

  methods.setAll = values => {
    client.hmset(publisherId, values);
  };

  methods.set = (key, value) => {
    client.hset(publisherId, key, value);
  };

  return methods;
};
