const express = require('express');
const {check, validationResult} = require('express-validator');
const IndieAuth = require('indieauth-helper');

const auth = new IndieAuth({
  secret: process.env.SESSION_SECRET
});

const router = new express.Router();

router.get('/:path(sign-in|log-in)?', (req, res) => {
  const {app} = req.app.locals;
  const {redirect} = req.query;
  let redirectUri = `${app.url}/auth`;

  if (redirect) {
    redirectUri = `${redirectUri}?redirect=${redirect}`;
  }

  auth.options.clientId = app.url;
  auth.options.redirectUri = redirectUri;

  res.render('sign-in');
});

router.post('/sign-in', [
  check('url')
    .isURL({require_protocol: true}).withMessage((value, {req, path}) => {
      return req.__(`error.validation.${path}`);
    })
], async (req, res) => {
  const {url} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('sign-in', {
      errors: errors.mapped(),
      url
    });
  } else if (url) {
    try {
      auth.options.me = url;
      const authUrl = await auth.getAuthUrl('code', ['create']);
      return res.redirect(authUrl);
    } catch (error) {
      console.error(error);
      res.end('Error getting auth url, check logs');
    }
  }
});

router.get('/auth', async (req, res) => {
  const {code, state, redirect} = req.query;
  if (code && state && auth.validateState(state)) {
    try {
      const token = await auth.getToken(code);
      req.session.me = auth.options.me;
      req.session.indieauthToken = token;
      res.redirect(redirect);
    } catch (error) {
      console.log(error);
      res.end('Error getting token, check the logs');
    }
  } else {
    res.end('Missing code or state mismatch');
  }
});

router.get('/:path(sign-out|log-out)', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
