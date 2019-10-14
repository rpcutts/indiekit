const fs = require('fs');
const path = require('path');
const https = require('https');
const debug = require('debug')('indiekit:app');
const express = require('express');
const favicon = require('serve-favicon');
const i18n = require('i18n');
const nunjucks = require('nunjucks');
const micropub = require('@indiekit/micropub').middleware;
const Publication = require('@indiekit/publication');
const Publisher = require('@indiekit/publisher-github');
const {utils} = require('@indiekit/support');
const session = require('express-session');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);

(async () => {
  const config = await require('./config');

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
    defaultLocale: 'en',
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    queryParameter: 'lang'
  });
  app.use(i18n.init);

  // Redis
  const client = redis.createClient({
    url: process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : null
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

  // Publisher
  const github = new Publisher({
    branch: config.github.branch,
    repo: config.github.repo,
    token: config.github.token,
    user: config.github.user
  });

  // Publication
  const publication = new Publication({
    configPath: config.pub.configPath,
    defaults: require('@indiekit/config-jekyll'),
    endpointUrl: config.app.url,
    publisher: github,
    url: config.app.me
  });

  // Add application and publication data to locals
  app.use(async (req, res, next) => {
    const url = `${req.protocol}://${req.headers.host}`;
    app.locals.app = config.app;
    app.locals.app.url = url;
    app.locals.github = config.github;
    app.locals.pub = await publication.getConfig();
    app.locals.session = req.session;

    next();
  });

  // Micropub endpoint
  app.use('/micropub', micropub.post({
    me: config.app.me
  }));

  // Micropub media endpoint
  app.use('/media', micropub.media({
    me: config.app.me
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
  app.use('/config', authenticate, require('./routes/config'));
  app.use('/share', authenticate, require('./routes/share'));
  app.use('/docs', require('./routes/docs'));
  app.use(require('./routes/session'));
  app.use(require('./routes/error'));

  // Handle errors
  app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
    debug(error.status);
    res.status(error.status || 500);

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
})();
//
// module.exports = app;
