const express = require('express');
const {check, validationResult} = require('express-validator');

// Models
const application = require('../models/application');
const publication = require('../models/publication');
const publisher = require('../models/publisher');

const router = new express.Router();

// Configuration
router.get('/', async (req, res) => {
  const configured = await application.get('configured');
  if (configured) {
    res.render('config/index');
  } else {
    res.redirect('/config/application');
  }
});

// Application
router.get('/application', (req, res) => {
  res.render('config/application', {referrer: req.query.referrer});
});

router.post('/application', (req, res) => {
  const {publisherId, locale, themeColor} = req.body;
  const {referrer} = req.query;

  res.cookie('locale', locale, {maxAge: 900000});
  application.setAll({publisherId, locale, themeColor});
  res.redirect(referrer || `/config/${publisherId}`);
});

// Publisher (GitHub/GitLab)
router.get('/:publisherId(github|gitlab)', (req, res) => {
  const {publisherId} = req.params;

  res.render(`config/${publisherId}`, {referrer: req.query.referrer});
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('config/github', {errors: errors.mapped()});
  }

  publisher('github').setAll(req.body);
  res.redirect(req.query.referrer || '/config/publication');
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('config/gitlab', {errors: errors.mapped()});
  }

  publisher('gitlab').setAll(req.body);
  res.redirect(req.query.referrer || '/config/publication');
});

// Publication
router.get('/publication', (req, res) => {
  res.render('config/publication', {referrer: req.query.referrer});
});

router.post('/publication', (req, res) => {
  application.set('configured', true);
  publication.setAll(req.body);
  res.redirect(req.query.referrer || '/config');
});

router.get('/publication/settings', (req, res) => {
  res.render('config/publication-settings');
});

module.exports = router;
