const markdown = require('./markdown');

const filters = {
  /**
   * Convert a string of text to Markdown
   *
   * @param {String} str Markdown
   * @param {String} value If 'inline', HTML rendered without paragraph tags
   * @return {String} HTML
   *
   */
  markdown(str, value) {
    if (value === 'inline') {
      return markdown.renderInline(str);
    }

    return markdown.render(str);
  }
};

module.exports = filters;
