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
const config = module.exports;

// Server
config.port = process.env.PORT || 3000;
config.secret = crypto.createHash('md5').update(pkg.name).digest('hex');

// Application
config.app = async () => {
  return {
    name: 'IndieKit',
    description: pkg.description,
    version: pkg.version,
    repository: pkg.repository,
    configPath: await client.hget('publication', 'configPath'),
    locale: await client.hget('app', 'locale') || 'en',
    me: await client.hget('app', 'me'),
    publisher: await client.hget('app', 'publisher') || 'github',
    themeColor: await client.hget('app', 'themeColor') || '#0000ee',
    token: await client.hget('app', 'token')
  };
};

// Publisher
config.publisher = async () => {
  return {
    branch: await client.hget('publisher', 'branch'),
    repo: await client.hget('publisher', 'repo'),
    token: await client.hget('publisher', 'token'),
    user: await client.hget('publisher', 'user')
  };
};

debug(config);
