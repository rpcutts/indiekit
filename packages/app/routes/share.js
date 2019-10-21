const querystring = require('querystring');
const axios = require('axios');
const debug = require('debug')('indiekit:app');
const express = require('express');

const router = new express.Router();

router.get('/:path?', (req, res) => {
  res.render('share', {
    content: req.query.content,
    name: req.query.name,
    url: req.query.url,
    success: req.query.success,
    minimalui: (req.params.path === 'bookmarklet')
  });
});

// Post to micropub endpoint here so we can handle the returned JSON
router.post('/*', async (req, res, next) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const response = await axios.post(`${host}/micropub`,
      querystring.stringify(req.body)
    );

    const success = response.data;
    if (success) {
      debug('Response JSON: %O', success);
      const message = encodeURIComponent(success.success_description);
      res.redirect(`?success=${message}`);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
