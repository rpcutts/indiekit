const debug = require('debug')('indiekit:app');
const express = require('express');
const {check, validationResult} = require('express-validator');
const config = require('../config');

const {client} = config;
const router = new express.Router();

// Configuration
router.get('/', async (req, res) => {
  const configured = await client.get('configured');
  console.log('configured', configured);
  if (configured) {
    res.render('config/index', {config});
  } else {
    res.redirect('/config/app');
  }
});

// Application
router.get('/app', async (req, res) => {
  res.render('config/app', {
    referrer: req.query.referrer
  });
});

router.post('/app', (req, res) => {
  const {publisher, locale, themeColor} = req.body;
  const {me} = req.session;
  console.log('me', me);
  const {referrer} = req.query;
  client.hmset('app', {publisher, locale, themeColor});
  client.hmset('pub', {me});
  res.redirect(referrer || `/config/${publisher}`);
});

// GitHub
router.get('/github', async (req, res) => {
  res.render('config/github', {
    referrer: req.query.referrer
  });
});

router.post('/github', [
  check('user')
    .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.github.${path}.error`);
    }),
  check('repo')
    .matches(/^[a-zA-Z0-9-_]+$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.github.${path}.error`);
    }),
  check('token')
    .matches(/^[0-9a-fA-F]{40}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.github.${path}.error`);
    })
], async (req, res) => {
  const {user, repo, branch, token} = req.body;
  const {referrer} = req.query;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.render('config/github', {
      errors: errors.mapped(),
      user,
      repo,
      branch,
      token
    });
  } else if (user && repo && token) {
    client.hmset('github', {user, repo, branch, token});
    res.redirect(referrer || '/config/publication');
  }
});

// Application
router.get('/publication', async (req, res) => {
  res.render('config/pub', {
    referrer: req.query.referrer
  });
});

router.post('/publication', (req, res) => {
  const {configPath} = req.body;
  const {referrer} = req.query;
  client.hmset('pub', {configPath});
  client.set('configured', true);
  res.redirect(referrer || '/config');
});

module.exports = router;
