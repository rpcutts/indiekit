require('dotenv').config();

const pkg = require(process.env.PWD + '/package');
const Publisher = require('@indiekit/publisher-github');

const github = new Publisher({
  token: process.env.GITHUB_TOKEN || console.warn('Missing GITHUB_TOKEN'),
  user: process.env.GITHUB_USER || console.warn('Missing GITHUB_USER'),
  repo: process.env.GITHUB_REPO || console.warn('Missing GITHUB_REPO'),
  branch: process.env.GITHUB_BRANCH || 'master'
});

const config = module.exports;

// Server
config.name = 'IndieKit';
config.version = pkg.version;
config.description = pkg.description;
config.repository = pkg.repository;
config.port = (process.env.NODE_ENV === 'test') ?
  null : // Don’t assign a port when running concurrent tests
  process.env.PORT || 3000;
config.mongoDbUri = process.env.MONGODB_URI;

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
