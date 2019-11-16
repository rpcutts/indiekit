const querystring = require('querystring');
const express = require('express');
const axios = require('axios');

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

router.post('/:path?', async (req, res, next) => {
  const host = `${req.protocol}://${req.headers.host}`;
  try {
    const response = await axios.post(`${host}/micropub`,
      querystring.stringify(req.body)
    );

    const success = response.data;
    if (success) {
      const message = encodeURIComponent(success.success_description);
      res.redirect(`?success=${message}`);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
