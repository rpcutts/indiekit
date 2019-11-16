const express = require('express');

const router = new express.Router();

// Middleware
const auth = require('../middleware/authenticate');

// Routes
router.use('/config', auth, require('./config'));
router.use('/docs', require('./docs'));
router.use('/micropub', require('./micropub'));
router.use('/share', auth, require('./share'));
router.use('/', require('./session'));

router.get('/', async (req, res) => {
  const {app} = res.locals;
  console.log('app.configured', app.configured);
  const path = (app.configured) ?
    '/config' :
    `/docs/${app.locale}/config`;
  res.redirect(path);
});

module.exports = router;
