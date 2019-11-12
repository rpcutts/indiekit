const JSONCache = require('redis-json');

const server = require('./../config/server');

module.exports = name => {
  const {client} = server;

  return new JSONCache(client, {
    prefix: `${name}:`
  });
};
