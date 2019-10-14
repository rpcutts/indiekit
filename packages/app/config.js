require('dotenv').config();
const crypto = require('crypto');
const {promisify} = require('util');
const debug = require('debug')('indiekit:app');
const redis = require('redis');

const pkg = require(process.env.PWD + '/package');

// Redis
const client = redis.createClient({
  url: process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : null
});

client.on('error', error => {
  debug(error);
});

client.hget = promisify(client.hget);

// Config
const config = (async () => {
  return {
    port: (process.env.NODE_ENV === 'test') ? null : process.env.PORT || 3000,
    secret: crypto.createHash('md5').update(pkg.name).digest('hex'),

    app: {
      name: 'IndieKit',
      description: pkg.description,
      version: pkg.version,
      repository: pkg.repository,

      locale: await client.hget('app', 'locale') || 'en',
      me: await client.hget('app', 'me'),
      publisher: await client.hget('app', 'publisher') || 'github',
      themeColor: await client.hget('app', 'themeColor') || '#0000ee',
      token: await client.hget('app', 'token')
    },

    pub: {
      configPath: await client.hget('pub', 'configPath')
    },

    github: {
      branch: await client.hget('github', 'branch'),
      repo: await client.hget('github', 'repo'),
      token: await client.hget('github', 'token'),
      user: await client.hget('github', 'user')
    }
  };
})();

module.exports = config;
