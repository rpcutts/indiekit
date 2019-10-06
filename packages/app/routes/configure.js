const express = require('express');
const {check, validationResult} = require('express-validator');

const config = require('../config');

const router = new express.Router();

// Server
router.get('/',
  (req, res) => {
    res.render('configure/index');
  }
);

router.post('/',
  (req, res) => {
    const {locale, color} = req.body;
    req.session.locale = locale;

    // Update environment vars (persistant) and config (now)
    process.env.THEME_COLOR = color;
    config.themeColor = color;

    // Redirect to next item
    res.redirect('/configure/publisher');
  }
);

// Publisher
router.get('/publisher',
  (req, res) => {
    res.render('configure/publisher');
  }
);

router.post('/publisher',
  (req, res) => {
    const {publisher} = req.body;
    req.session.publisher = publisher;
    res.redirect(`/configure/publisher/${publisher}`);
  }
);

// Publisher - GitHub
router.get('/publisher/github',
  (req, res) => {
    res.render('configure/publisher/github');
  }
);

router.post('/publisher/github', [
  check('user')
    .matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`publisher-github.configure.${path}.error`);
    }),
  check('repo')
    .matches(/^[a-zA-Z0-9-_]+$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`publisher-github.configure.${path}.error`);
    }),
  check('token')
    .matches(/^[0-9a-fA-F]{40}$/i)
    .withMessage((value, {req, path}) => {
      return req.__(`publisher-github.configure.${path}.error`);
    })
], async (req, res) => {
  const {user, repo, branch, token} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('configure/publisher/github', {
      errors: errors.mapped(),
      user,
      repo,
      branch,
      token
    });
  } else if (user && repo && token) {
    process.env.GITHUB_USER = user;
    process.env.GITHUB_REPO = repo;
    process.env.GITHUB_BRANCH = branch;
    process.env.GITHUB_TOKEN = token;
    res.redirect('/configure/done');
  }
});

// Done
router.get('/done',
  (req, res) => {
    res.render('configure/done');
  }
);

module.exports = router;
