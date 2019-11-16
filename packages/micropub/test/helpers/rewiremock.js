const rewiremock = require('rewiremock/node');

rewiremock('ioredis')
  .by('ioredis-mock');

module.exports = rewiremock;
