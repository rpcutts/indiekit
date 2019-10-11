const fs = require('fs');
const path = require('path');
const https = require('https');
const _ = require('lodash');
const debug = require('debug')('indiekit:app');
const express = require('express');
const favicon = require('serve-favicon');
const i18n = require('i18n');
const nunjucks = require('nunjucks');
const micropub = require('@indiekit/micropub').middleware;
const Publication = require('@indiekit/publication');
const {utils} = require('@indiekit/support');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const {ServerError} = require('@indiekit/support');

const config = require('./config');

const {port} = config;
const app = express();

// Correctly report secure connections
app.enable('trust proxy');

// Parse Nunjucks templates
const componentsDir = path.join(__dirname, 'components');
const viewsDir = path.join(__dirname, 'views');
const staticDir = path.join(__dirname, 'static');
const env = nunjucks.configure([componentsDir, viewsDir, staticDir], {
  autoescape: true,
  express: app,
  watch: true
});
env.addFilter('markdown', utils.renderMarkdown);
env.addFilter('date', utils.formatDate);
app.set('view engine', 'njk');

// Serve static files and paths
app.use(express.static(staticDir));
app.use(favicon(`${staticDir}/favicon.ico`));

// Parse application/x-www-form-urlencoded requests
app.use(express.urlencoded({
  extended: true
}));

// Internationalisation
i18n.configure({
  defaultLocale: config.locale,
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  queryParameter: 'lang'
});
app.use(i18n.init);

// Redis
const client = redis.createClient({
  url: config.redisUrl
});

client.on('error', error => {
  debug(error);
});

// Session
app.use(session({
  cookie: {
    secure: true
  },
  name: config.name,
  resave: false,
  saveUninitialized: false,
  secret: config.secret,
  store: new RedisStore({client})
}));

// Add application and publication data to locals
app.use(async (req, res, next) => {
  const url = `${req.protocol}://${req.headers.host}`;

  app.locals.app = config;
  app.locals.app.url = url;
  app.locals.pub = await new Publication({
    configPath: config.publication.configPath,
    defaults: config.publication.defaults,
    endpointUrl: url,
    publisher: config.publisher,
    url: config.publication.url
  }).getConfig();

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

// Routes
const authenticate = async (req, res, next) => {
  // If current session, proceed to next middleware
  if (req.session && req.session.me) {
    return next();
  }

  // No current session
  res.redirect(`/sign-in?redirect=${req.originalUrl}`);
};

// Routes
app.use('/configure', authenticate, require('./routes/configure'));
app.use('/share', authenticate, require('./routes/share'));
app.use('/docs', require('./routes/docs'));
app.use(require('./routes/session'));
app.use(require('./routes/error'));

// Handle errors
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = error.status || 500;
  const name = error.name || 'Internal server error';

  if (req.accepts('html')) {
    // Respond with HTML
    res.render('error', {
      status,
      error: name,
      error_description: error.message,
      error_uri: error.uri
    });
  } else {
    if (req.accepts('json')) {
      // Respond with JSON
      return res.status(status).send({
        error: _.snakeCase(name),
        error_description: error.message,
        error_uri: error.uri
      });
    }

    // Default to plain-text
    return res.status(status).type('txt').send(
      `${name}: ${error.message}`
    );
  }
});

// Start application
if (process.env.NODE_ENV === 'test') {
  app.listen();
} else if (process.env.NODE_ENV === 'production') {
  debug('Listening on port %s', port);
  app.listen(port);
} else {
  const options = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
    passphrase: process.env.PASSPHRASE
  };
  debug('Listening on port %s', port);
  https.createServer(options, app).listen(port);
}

module.exports = app;
