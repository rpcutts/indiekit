const express = require('express');
const httpError = require('http-errors');

const router = new express.Router();

// Error (for testing)
router.get('/teapot', (req, res, next) => {
  return next(httpError(418, 'https://tools.ietf.org/html/rfc2324'));
});

// 404
router.use((req, res, next) => {
  return next(httpError(404, req.__('The requested resource was not found')));
});

module.exports = router;
