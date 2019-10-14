const markdown = require('markdown-it');
const uslug = require('uslug');

module.exports = (() => {
  const uslugify = s => uslug(s);

  const opts = {
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  };

  const plugins = [
    [require('markdown-it-anchor'), {
      permalink: true,
      permalinkBefore: true,
      slugify: uslugify
    }],
    require('markdown-it-deflist'),
    require('markdown-it-prism')
  ];

  const parser = markdown(opts);

  if (plugins) {
    plugins.forEach(plugin => {
      if (Array.isArray(plugin)) {
        // Allow array of options to be passed.
        parser.use(...plugin);
      } else {
        parser.use(plugin);
      }
    });
  }

  return parser;
})();
