const path = require('path');
const express = require('express');
const {utils} = require('@indiekit/support');

const router = new express.Router();

router.get('*', (req, res, next) => {
  try {
    const filepath = path.join(__dirname, '../', req.originalUrl);
    const file = utils.resolveFilePath(filepath, 'md');
    const content = utils.renderDocument(file, req.app.locals);

    res.render('_document', {
      body: content.body,
      page: content.page,
      title: content.title
    });
  } catch (error) {
    next();
  }
});

module.exports = router;
