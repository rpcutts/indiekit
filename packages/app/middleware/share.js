const querystring = require('querystring');
const axios = require('axios');

module.exports = async (req, res, next) => {
  // GET
  if (req.method === 'GET') {
    res.render('share', {
      content: req.query.content,
      name: req.query.name,
      url: req.query.url,
      success: req.query.success,
      minimalui: req.params.path.includes('bookmarklet')
    });
  }

  // POST
  if (req.method === 'POST') {
    const host = `${req.protocol}://${req.headers.host}`;
    console.log('host', host);
    try {
      const response = await axios.post(`${host}/micropub`,
        querystring.stringify(req.body)
      );
      console.log('response', response);

      const success = response.data;
      if (success) {
        const message = encodeURIComponent(success.success_description);
        res.redirect(`?success=${message}`);
      }
    } catch (error) {
      console.log('error', error);
      next(error);
    }
  }
};
