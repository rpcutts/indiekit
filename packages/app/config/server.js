require('dotenv').config();
const os = require('os');
const path = require('path');
const Redis = require('ioredis');

module.exports = {
  client: new Redis(process.env.REDIS_URL),
  port: (process.env.NODE_ENV === 'test') ? null : process.env.PORT || 3000,
  secret: process.env.SECRET || 'secret',
  tmpdir: path.join(os.tmpdir(), 'indiekit')
};
