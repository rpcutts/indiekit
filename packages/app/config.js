require('dotenv').config();
const crypto = require('crypto');
const debug = require('debug')('indiekit:app');

const pkg = require(process.env.PWD + '/package');
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  token: process.env.GITHUB_TOKEN || debug('Missing GITHUB_TOKEN'),
  user: process.env.GITHUB_USER || debug('Missing GITHUB_USER'),
  repo: process.env.GITHUB_REPO || debug('Missing GITHUB_REPO'),
  branch: process.env.GITHUB_BRANCH
});

const config = module.exports;

// Server
config.name = 'IndieKit';
config.version = pkg.version;
config.description = pkg.description;
config.repository = pkg.repository;
config.port = process.env.PORT || 3000;
config.redisUrl = process.env.NODE_ENV === 'production' ?
  process.env.REDIS_URL :
  null;
config.secret = crypto.createHash('md5').update(pkg.name).digest('hex');

// Customisation
config.locale = process.env.INDIEKIT_LOCALE || 'en';
config.themeColor = process.env.THEME_COLOR || '#0000ee';

// Publisher
config.publisher = github;

// Publication
config.publication = {
  configPath: process.env.INDIEKIT_CONFIG_PATH,
  defaults: require('@indiekit/config-jekyll'),
  url: process.env.INDIEKIT_URL
};
