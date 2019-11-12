const debug = require('debug')('indiekit:app');
const express = require('express');
const {check, validationResult} = require('express-validator');
const server = require('../config/server');

const {client} = server;
const router = new express.Router();

// Configuration
router.get('/', async (req, res) => {
  const configured = await client.get('configured');
  if (configured) {
    res.render('config/index', {server});
  } else {
    res.redirect('/config/app');
  }
});

// Application
router.get('/app', (req, res) => {
  res.render('config/app', {
    referrer: req.query.referrer
  });
});

router.post('/app', (req, res) => {
  const {publisherId, locale, themeColor} = req.body;
  const {me} = req.session;
  const {referrer} = req.query;
  res.cookie('locale', locale, {
    maxAge: 900000
  });
  client.hmset('app', {publisherId, locale, themeColor});
  client.hmset('pub', {me});
  res.redirect(referrer || `/config/${publisherId}`);
});

// Publisher (GitHub/GitLab)
router.get('/:publisherId(github|gitlab)', (req, res) => {
  const {publisherId} = req.params;

  res.render(`config/${publisherId}`, {
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
    .matches(/^[a-z0-9-_]+$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.github.${path}.error`);
    }),
  check('token')
    .matches(/^[a-f0-9]{40}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.github.${path}.error`);
    })
], (req, res) => {
  const {referrer} = req.query;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('config/github', {
      errors: errors.mapped()
    });
  }

  client.hmset('github', req.body);
  res.redirect(referrer || '/config/publication');
});

router.post('/gitlab', [
  check('instance')
    .isURL({require_protocol: true})
    .withMessage((value, {req, path}) => {
      return req.__(`config.gitlab.${path}.error`);
    }),
  check('user')
    .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.gitlab.${path}.error`);
    }),
  check('repo')
    .matches(/^[a-z0-9-_]+$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.gitlab.${path}.error`);
    }),
  check('token')
    .matches(/^[a-z0-9]{20}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`config.gitlab.${path}.error`);
    })
], (req, res) => {
  const {referrer} = req.query;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('config/gitlab', {
      errors: errors.mapped()
    });
  }

  client.hmset('gitlab', req.body);
  res.redirect(referrer || '/config/publication');
});

// Application
router.get('/publication', (req, res) => {
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
