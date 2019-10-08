const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const {DateTime} = require('luxon');
const frontmatter = require('front-matter');
const markdown = require('./markdown');
const nunjucks = require('nunjucks');

const utils = {
  /**
   * Add data to an array, creating it if doesn’t exist.
   *
   * @function addToArray
   * @param {Array} arr Array
   * @param {Object} data Data to add
   * @return {Array} Updated array
   */
  addToArray(arr, data) {
    if (!arr) {
      arr = [];
    }

    arr.push(data);

    return arr;
  },

  /**
   * Remove falsey values if provided object is an array.
   *
   * @function cleanArray
   * @param {Object} obj Object containing array to be cleaned
   * @return {Array|Object} Cleaned array, else original object
   */
  cleanArray(obj) {
    return _.isArray(obj) ? _.compact(obj) : obj;
  },

  /**
   * Recursively remove empty, null and falsy values from an object.
   * Adapted from Ori Drori’s answer on Stack Overflow
   * https://stackoverflow.com/a/54186837
   *
   * @function cleanObject
   * @param {Object} obj Object to clean
   * @return {Object} Cleaned object
   */
  cleanObject(obj) {
    return _.transform(obj, (prop, value, key) => {
      const isObject = _.isObject(value);
      const val = isObject ? utils.cleanArray(utils.cleanObject(value)) : value;
      const keep = isObject ? !_.isEmpty(val) : Boolean(val);

      if (keep) {
        prop[key] = val;
      }
    });
  },

  /**
   * Decode form-encoded string.
   *
   * @function decodeFormEncodedString
   * @example decodeFormEncodedString('foo+bar') => 'foo bar'
   * @example decodeFormEncodedString('http%3A%2F%2Ffoo.bar') => 'http://foo.bar'
   * @param {String} str String to decode
   * @return {String} Decoded string
   */
  decodeFormEncodedString(str) {
    if (typeof str === 'string') {
      str = str.replace(/\+/g, '%20');
      return decodeURIComponent(str);
    }

    return false;
  },

  /**
   * Format date
   *
   * @function formatDate
   * @param {String} str ISO 8601 date
   * @param {String} format Tokenised date format
   * @return {String} Formatted date
   */
  formatDate(str, format) {
    const date = (str === 'now') ? DateTime.local() : str;

    const datetime = DateTime.fromISO(date, {
      locale: 'en-GB',
      zone: 'utc'
    }).toFormat(format);

    return datetime;
  },

  /**
   * Render a Nunjucks template string using context data.
   *
   * @function render
   * @param {String} string Template string
   * @param {String} context Context data
   * @return {String} Rendered string
   */
  render(string, context) {
    const env = new nunjucks.Environment();

    env.addFilter('date', module.exports.formatDate);

    return env.renderString(string, context);
  },

  /**
   * Render a document which has YAML frontmatter and Nunjucks variables.
   *
   * @function renderDocument
   * @param {String} file File to parse
   * @param {String} context Context data
   * @return {Object} Document data object
   */
  renderDocument(file, context) {
    // Read file
    let string = fs.readFileSync(file);

    // Convert file buffer to string
    string = Buffer.from(string).toString('utf8');

    // Parse YAML frontmatter
    const document = frontmatter(string);

    // Add YAML frontmatter data to provided context under the `page` key
    context.page = document.attributes;

    // Return document object with Nunjucks rendered body
    return {
      body: utils.render(document.body, context),
      page: document.attributes,
      title: utils.render(document.attributes.title, context)
    };
  },

  /**
   * Render Markdown string as HTML
   *
   * @function renderMarkdown
   * @param {String} str Markdown
   * @param {String} value If 'inline', HTML rendered without paragraph tags
   * @return {String} HTML
   *
   */
  renderMarkdown(str, value) {
    if (value === 'inline') {
      return markdown.renderInline(str);
    }

    return markdown.render(str);
  },

  /**
   * Resolve a URL path to either named file, or index in named folder.
   *
   * @function resolveFilePath
   * @param {String} urlpath Path to file
   * @param {String} ext File extension
   * @return {String} Resolved path to file on disk
   */
  resolveFilePath(urlpath, ext) {
    const dir = `${urlpath}.${ext}`;
    if (fs.existsSync(dir)) {
      return dir;
    }

    return path.join(urlpath, `index.${ext}`);
  }
};

module.exports = utils;
