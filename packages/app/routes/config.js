const debug = require('debug')('indiekit:app');
const express = require('express');
const {check, validationResult} = require('express-validator');
const config = require('../config');

// Redis
const Redis = require('ioredis');

const client = new Redis(
  process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : null
);

const router = new express.Router();

// Configuration
router.get('/', async (req, res) => {
  // If we have already configured a publication URL, assume we have configured
  // everything else. Will probably need to revisit this.
  if (req.app.locals.app.me) {
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
  const {me, token, publisher, locale, themeColor} = req.body;
  const {referrer} = req.query;
  client.hmset('app', {me, token, publisher, locale, themeColor});
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
    res.redirect(referrer || '/config');
  }
});

module.exports = router;
