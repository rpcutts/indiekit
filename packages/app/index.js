const fs = require('fs');
const path = require('path');
const https = require('https');
const debug = require('debug')('indiekit:app');
const express = require('express');
const cookies = require('cookie-parser');
const session = require('express-session');
const favicon = require('serve-favicon');
const i18n = require('i18n');
const nunjucks = require('nunjucks');
const RedisStore = require('connect-redis')(session);

const utils = require('@indiekit/support');

const application = require('./config/application');
const server = require('./config/server');

const {client} = server;
const {port} = server;
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
env.addFilter('date', utils.formatDate);
env.addFilter('markdown', utils.renderMarkdown);
app.set('view engine', 'njk');

// Serve static files and paths
app.use(express.static(staticDir));
app.use(favicon(`${staticDir}/favicon.ico`));

// Parse application/x-www-form-urlencoded requests
app.use(express.urlencoded({
  extended: true
}));

// Use cookies
app.use(cookies());

// Session
app.use(session({
  cookie: {
    secure: true
  },
  name: application.name,
  resave: false,
  saveUninitialized: false,
  secret: server.secret,
  store: new RedisStore({client})
}));

// Internationalisation
i18n.configure({
  cookie: 'locale',
  defaultLocale: 'en',
  directory: path.join(__dirname, 'locales'),
  indent: '  ',
  objectNotation: true,
  queryParameter: 'lang'
});
app.use(i18n.init);

// Add application and publication data to locals
app.use(async (req, res, next) => {
  // Get publisher settings
  const github = await client.hgetall('github');
  const gitlab = await client.hgetall('gitlab');

  // Determine URL of application server
  const url = `${req.protocol}://${req.headers.host}`;

  // Get publication settings
  const pub = await client.hgetall('pub');

  // Set locals for use in application templates
  res.locals.app = await application;
  res.locals.app.url = url;
  res.locals.github = github;
  res.locals.gitlab = gitlab;
  res.locals.pub = pub;
  res.locals.session = req.session;

  next();
});

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
app.use('/config', authenticate, require('./routes/config'));
app.use('/share', authenticate, require('./routes/share'));
app.use(require('./routes/docs'));
app.use(require('./routes/micropub'));
app.use(require('./routes/session'));
app.use(require('./routes/error'));

// Handle errors
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  error.status = error.status || 500;
  res.status(error.status);
  debug(error.stack);

  if (req.accepts('html')) {
    // Respond with HTML
    res.render('error', {
      error
    });
  } else {
    if (req.accepts('json')) {
      // Respond with JSON
      return res.json({
        error: error.name,
        error_description: error.message,
        error_uri: error.uri
      });
    }

    // Default to plain-text
    return res.type('txt').send(`${error.name}: ${error.message}`);
  }
});

// Start application
if (process.env.NODE_ENV === 'production') {
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
