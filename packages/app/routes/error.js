const _ = require('lodash');
const express = require('express');
const {ServerError} = require('@indiekit/support');

const router = new express.Router();

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

router.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (error instanceof ServerError) {
    return res.status(error.status).send({
      error: _.snakeCase(error.name),
      error_description: error.message,
      error_uri: error.uri
    });
  }

  return res.status(500).send({
    error: 'Internal server error',
    error_description: error.message
  });
});

module.exports = router;
