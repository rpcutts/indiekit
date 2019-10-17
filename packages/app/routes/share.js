const querystring = require('querystring');
const debug = require('debug')('indiekit:app');
const express = require('express');
const fetch = require('node-fetch');

const router = new express.Router();

router.get('/', (req, res) => {
  res.render('share', {
    content: req.query.content,
    name: req.query.name,
    url: req.query.url,
    success: req.query.success
  });
});

router.get('/bookmarklet', (req, res) => {
  res.render('share', {
    content: req.query.content,
    name: req.query.name,
    url: req.query.url,
    success: req.query.success,
    minimalui: true
  });
});

// Post to micropub endpoint here so we can handle the returned JSON
router.post('/*', async (req, res, next) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const response = await fetch(`${host}/micropub`, {
      method: 'post',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: querystring.stringify(req.body)
    });

    const json = await response.json();
    if (json) {
      debug('Response JSON: %O', json);
      const message = encodeURIComponent(json.success_description);
      res.redirect(`?success=${message}`);
    }
  } catch (error) {
    debug(error);
    next(error);
  }
});

module.exports = router;
