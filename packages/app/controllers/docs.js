const fs = require('fs');
const path = require('path');
const express = require('express');
const frontmatter = require('front-matter');
const utils = require('@indiekit/support');

const router = new express.Router();

router.get('/*', (req, res, next) => {
  try {
    const filepath = path.join(__dirname, '..', req.originalUrl);
    const file = (fs.existsSync(filepath)) ?
      path.join(filepath, 'index.md') :
      `${filepath}.md`;

    // Read file
    const string = fs.readFileSync(file, 'utf8');

    // Parse YAML frontmatter
    const document = frontmatter(string);

    res.render('document', {
      page: document.attributes,
      title: utils.render(document.attributes.title, res.locals),
      content: utils.render(document.body, res.locals)
    });
  } catch (error) {
    next();
  }
});

module.exports = router;
