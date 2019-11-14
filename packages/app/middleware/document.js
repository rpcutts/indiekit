const fs = require('fs');
const path = require('path');
const frontmatter = require('front-matter');

const utils = require('@indiekit/support');

module.exports = (req, res, next) => {
  try {
    const {locale} = req.params;
    const docpath = req.originalUrl.replace(`${locale}/docs`, `docs/${locale}`);
    const filepath = path.join(__dirname, '..', docpath);
    const file = (fs.existsSync(filepath)) ?
      path.join(filepath, 'index.md') :
      `${filepath}.md`;

    // Read file
    const string = fs.readFileSync(file, 'utf8');

    // Parse YAML frontmatter
    const document = frontmatter(string);

    res.render('_document', {
      page: document.attributes,
      title: utils.render(document.attributes.title, res.locals),
      content: utils.render(document.body, res.locals)
    });
  } catch (error) {
    next();
  }
};
