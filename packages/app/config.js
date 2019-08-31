require('dotenv').config();

const pkg = require(process.env.PWD + '/package');

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
config.themeColor = '#f60';

// Publisher
config.publisher = require('@indiekit/publisher-github');

// Publication
config.publication = {
  configPath: process.env.INDIEKIT_CONFIG_PATH,
  defaults: require('@indiekit/config-jekyll'),
  url: process.env.INDIEKIT_URL
};
