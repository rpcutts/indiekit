require('dotenv').config();
const Redis = require('ioredis');

const pkg = require(process.env.PWD + '/package');

const config = {
  client: new Redis(process.env.REDIS_URL),
  port: (process.env.NODE_ENV === 'test') ? null : process.env.PORT || 3000,
  secret: process.env.SECRET || 'secret',

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

module.exports = config;
