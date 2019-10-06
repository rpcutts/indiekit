const express = require('express');

const router = new express.Router();

router.get('/', (req, res) => {
  res.render('share', {
    content: req.query.content,
    name: req.query.name,
    url: req.query.url
  });
});

module.exports = router;
