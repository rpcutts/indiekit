require('dotenv').config();
const os = require('os');
const path = require('path');
const Redis = require('ioredis');

const pkg = require(process.env.PWD + '/package');

module.exports = {
  client: new Redis(process.env.REDIS_URL),
  port: (process.env.NODE_ENV === 'test') ? null : process.env.PORT || 3000,
  secret: process.env.SECRET || 'secret',
  tmpdir: path.join(os.tmpdir(), pkg.name),

  // Default application settings
  app: {
    name: 'IndieKit',
    version: pkg.version,
    description: pkg.description,
    repository: pkg.repository,
    locale: 'en',
    publisher: 'github',
    themeColor: '#0000ee'
  }
};
