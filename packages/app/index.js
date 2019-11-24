const fs = require('fs');
const path = require('path');
const https = require('https');
const debug = require('debug')('indiekit:app');
const express = require('express');
const cookies = require('cookie-parser');
const session = require('express-session');
const favicon = require('serve-favicon');
const httpError = require('http-errors');
const i18n = require('i18n');
const nunjucks = require('nunjucks');
const timezones = require('tz-ids');
const languages = require('iso-639-1');

const {components, layouts} = require('@indiekit/frontend');
const utils = require('@indiekit/support');

const application = require('./models/application');
const publication = require('./models/publication');
const publisher = require('./models/publisher');
const server = require('./config/server');

const {port} = server;
const app = express();

// Correctly report secure connections
app.enable('trust proxy');

// Parse Nunjucks templates
const viewsDir = path.join(__dirname, 'views');
const staticDir = path.join(__dirname, 'static');
const env = nunjucks.configure([components, layouts, viewsDir, staticDir], {
  autoescape: true,
  express: app,
  watch: true
});
env.addFilter('date', utils.formatDate);
env.addFilter('emoji', utils.renderEmoji);
env.addFilter('markdown', utils.renderMarkdown);
env.addFilter('language', str => languages.getNativeName(str));
app.set('view engine', 'njk');

// Serve static files and paths
app.use(express.static(staticDir));
app.use(favicon(`${staticDir}/favicon.ico`));

// Parse application/x-www-form-urlencoded requests
app.use(express.urlencoded({
  extended: true
}));

// Session
app.use(cookies());
app.use(session({
  cookie: {
    secure: true
  },
  name: 'indiekit',
  resave: false,
  saveUninitialized: false,
  secret: server.secret
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
  res.locals.app = await application.getAll();
  res.locals.app.url = `${req.protocol}://${req.headers.host}`;
  res.locals.github = await publisher('github').getAll();
  res.locals.gitlab = await publisher('gitlab').getAll();
  res.locals.pub = await publication.getAll();
  res.locals.session = req.session;
  res.locals.timezones = timezones;
  res.locals.languages = languages.getLanguages(languages.getAllCodes());

  next();
});

// Route controllers
app.use(require('./controllers'));

// 404
app.use((req, res, next) => {
  return next(httpError(404, req.__('The requested resource was not found')));
});

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
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
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
