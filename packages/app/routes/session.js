const debug = require('debug')('indiekit:app');
const express = require('express');
const {check, validationResult} = require('express-validator');
const IndieAuth = require('indieauth-helper');
const server = require('./../config/server');

const auth = new IndieAuth({
  secret: server.secret
});

const router = new express.Router();

router.get('/', async (req, res) => {
  const {app} = res.locals;
  const path = (app.configured === true) ?
    '/' :
    `${app.locale}/docs/config`;
  res.redirect(path);
});

router.get('/sign-in', (req, res) => {
  const {app} = res.locals;
  const {redirect} = req.query;
  let redirectUri = `${app.url}/auth`;

  if (redirect) {
    redirectUri = `${redirectUri}?redirect=${redirect}`;
  }

  auth.options.clientId = app.url;
  auth.options.redirectUri = redirectUri;

  debug('auth.options: %O', auth.options);
  res.render('sign-in');
});

router.post('/sign-in', [
  check('me')
    .isURL({require_protocol: true})
    .withMessage((value, {req, path}) => {
      return req.__(`error.validation.${path}`);
    })
], async (req, res) => {
  const {me} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('sign-in', {
      errors: errors.mapped()
    });
  } else if (me) {
    auth.options.me = me;
    try {
      const authUrl = await auth.getAuthUrl('code', ['create']);
      res.redirect(authUrl);
    } catch (error) {
      debug(req.originalUrl, error);
      res.render('sign-in', {
        error: error.message
      });
    }
  }
});

router.get('/auth', async (req, res, next) => {
  const {code, me, state} = req.query;
  const redirect = req.query.redirect || '/';
  debug('/auth query', req.query);
  if (code && state && auth.validateState(state)) {
    try {
      const token = await auth.getToken(code);
      req.session.me = me;
      req.session.token = token;
      res.redirect(redirect);
    } catch (error) {
      debug(req.originalUrl, error);
      next(error);
    }
  } else {
    next(new Error('Missing code or state mismatch'));
  }
});

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
