require('dotenv').config();
const os = require('os');
const path = require('path');
const _ = require('lodash');
const Redis = require('ioredis');

const application = require('./application');

module.exports = {
  client: new Redis(process.env.REDIS_URL),
  port: (process.env.NODE_ENV === 'test') ? null : process.env.PORT || 3000,
  secret: process.env.SECRET || 'secret',
  tmpdir: path.join(os.tmpdir(), _.kebabCase(application.name))
};
