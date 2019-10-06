const express = require('express');
const {check, validationResult} = require('express-validator');

const router = new express.Router();

// Server
router.get('/',
  (req, res) => {
    res.render('configure/index');
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
    res.redirect('docs');
  }
});

module.exports = router;
