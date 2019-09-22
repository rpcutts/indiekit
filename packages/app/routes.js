const path = require('path');
const express = require('express');
const {ServerError, utils} = require('@indiekit/support');

const router = new express.Router();

// Index
router.get('/', (req, res) => {
  res.render('index');
});

// Documentation
router.get('/docs*', (req, res, next) => {
  try {
    const filepath = path.join(__dirname, req.originalUrl);
    const file = utils.resolveFilePath(filepath, 'md');
    const content = utils.renderDocument(file, req.app.locals);

    res.render('document', {
      body: content.body,
      page: content.page,
      title: content.title
    });
  } catch (error) {
    next();
  }
});

// Error (for testing)
router.get('/teapot', (req, res, next) => {
  return next(new ServerError('Teapot', 418, 'I’m a teapot', 'https://tools.ietf.org/html/rfc2324'));
});

// 404
router.use((req, res) => {
  res.status(404);

  if (req.accepts('text/html')) {
    res.render('error', {
      status: 404,
      error: req.__('Not found'),
      error_description: req.__('The requested resource was not found')
    });
  }
});

module.exports = router;
