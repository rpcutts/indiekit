const JSONCache = require('redis-json');

const {client} = require('./../config/server');

module.exports = name => {
  return new JSONCache(client, {
    prefix: `${name}:`
  });
};
