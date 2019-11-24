const debug = require('debug')('indiekit:app');
const express = require('express');

const router = new express.Router();

// Authentication middleware
const auth = (req, res, next) => {
  // If current session, proceed to next middleware
  if (req.session && req.session.me) {
    return next();
  }

  // No current session
  res.redirect(`/sign-in?redirect=${req.originalUrl}`);
};

// Routes
router.use('/config', auth, require('./config'));
router.use('/docs', require('./docs'));
router.use('/micropub', require('./micropub'));
router.use('/share', auth, require('./share'));
router.use('/', require('./session'));

router.get('/', async (req, res) => {
  const {app} = res.locals;
  const path = (app.configured) ? '/config' : `/docs/${app.locale}/config`;
  res.redirect(path);
});

module.exports = router;
