const path = require('path');
const _ = require('lodash');
const express = require('express');
const favicon = require('serve-favicon');
const i18n = require('i18n');
const nunjucks = require('nunjucks');
const micropub = require('@indiekit/micropub').middleware;
const Publication = require('@indiekit/publication');
const {ServerError, logger} = require('@indiekit/support');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const admin = require('./lib/admin');
const config = require('./config');
const filters = require('./lib/filters');
const routes = require('./routes');

const app = express();
const {port} = config;

// Correctly report secure connections
app.enable('trust proxy');

// Parse Nunjucks templates
const viewsDir = path.join(__dirname, 'views');
const staticDir = path.join(__dirname, 'static');
const env = nunjucks.configure([viewsDir, staticDir], {
  autoescape: true,
  express: app,
  watch: true
});
env.addFilter('markdown', filters.markdown);
app.set('view engine', 'njk');

// Serve static files and paths
app.use(express.static(staticDir));
app.use(favicon(`${staticDir}/favicon.ico`));

// Internationalisation
i18n.configure({
  defaultLocale: config.locale,
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  queryParameter: 'lang'
});
app.use(i18n.init);

// MongoDB
let store = false;
if (config.mongoDbUri) {
  mongoose.connect(config.mongoDbUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  store = new MongoStore({
    mongooseConnection: mongoose.connection
  });
}

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store
}));

// Add application and publication data to locals
app.use((req, res, next) => {
  const url = `${req.protocol}://${req.headers.host}`;

  app.locals.app = config;
  app.locals.app.url = url;
  app.locals.pub = new Publication({
    configPath: config.publication.configPath,
    defaults: config.publication.defaults,
    endpointUrl: url,
    publisher: config.publisher,
    url: config.publication.url
  });

  next();
});

// Log requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query
  });

  next();
});

// Micropub endpoint
app.use('/micropub', micropub.post({
  me: config.publication.url
}));

// Micropub media endpoint
app.use('/media', micropub.media({
  me: config.publication.url
}));

// Admin endpoint
app.use('/admin', admin({
  me: config.publication.url
}));

// Routes
app.use('/', routes);

// Errors
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (error instanceof ServerError) {
    return res.status(error.status).send({
      error: _.snakeCase(error.name),
      error_description: error.message,
      error_uri: error.uri
    });
  }

  return res.status(500).send({
    error: 'Internal server error',
    error_description: error.message
  });
});

app.listen(port, function () {
  if (process.env.NODE_ENV !== 'test') {
    console.info(`Starting ${config.name} on port ${this.address().port}`);
  }
});

module.exports = app;
