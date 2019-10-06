const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const favicon = require('serve-favicon');
const i18n = require('i18n');
const nunjucks = require('nunjucks');
const micropub = require('@indiekit/micropub').middleware;
const Publication = require('@indiekit/publication');
const {utils} = require('@indiekit/support');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const config = require('./config');

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
  cookie: {
    secure: true
  },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store
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
app.use('/configure', require('./routes/configure'));
app.use('/share', authenticate, require('./routes/share'));
app.use('/docs', require('./routes/docs'));
app.use(require('./routes/session'));
app.use(require('./routes/error'));

https.createServer({
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
  passphrase: process.env.PASSPHRASE
}, app).listen(config.port);

module.exports = app;
