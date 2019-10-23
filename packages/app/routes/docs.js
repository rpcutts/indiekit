const path = require('path');
const express = require('express');
const utils = require('@indiekit/support');

const router = new express.Router();

router.get('/:locale/docs*', (req, res, next) => {
  try {
    const {locale} = req.params;
    const docpath = req.originalUrl.replace(`${locale}/docs`, `docs/${locale}`);
    const filepath = path.join(__dirname, '..', docpath);
    const file = utils.resolveFilePath(filepath, 'md');
    const content = utils.renderDocument(file, res.locals);

    res.render('_document', {
      page: content.page,
      title: content.title,
      content: content.body
    });
  } catch (error) {
    next();
  }
});

module.exports = router;
