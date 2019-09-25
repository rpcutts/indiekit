const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const {DateTime} = require('luxon');
const fileType = require('file-type');
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
   * Add properties to object.
   *
   * @function addProperties
   * @param {Object} obj Object to update
   * @param {Object} additions Properties to add
   * @return {Object} Updated object
   */
  addProperties(obj, additions) {
    for (const key in additions) {
      if (Object.prototype.hasOwnProperty.call(additions, key)) {
        const newValue = additions[key];
        const existingValue = obj[key];

        // If no existing value, add it
        if (!existingValue) {
          obj[key] = newValue;
          return obj;
        }

        // If existing value, add to it
        if (existingValue) {
          const updatedValue = [...existingValue];

          for (const value of newValue) {
            updatedValue.push(value);
          }

          obj = _.set(obj, key, updatedValue);
          return obj;
        }
      }
    }
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
   * Generate random alpha-numeric string, 5 characters long.
   *
   * @function createRandomString
   * @example createRandomString() => 'b3dog'
   * @return {Object} Alpha-numeric string
   */
  createRandomString() {
    return (Number(new Date())).toString(36).slice(-5);
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
   * Delete individual entries for properties of an object.
   *
   * @function deleteEntries
   * @param {Object} obj Object to update
   * @param {Object} deletions Property entries to delete
   * @return {Object} Updated object
   */
  deleteEntries(obj, deletions) {
    for (const key in deletions) {
      if (Object.prototype.hasOwnProperty.call(deletions, key)) {
        const valuesToDelete = deletions[key];

        if (!Array.isArray(valuesToDelete)) {
          throw new TypeError(`${key} should be an array`);
        }

        const values = obj[key];
        if (!valuesToDelete || !values) {
          return obj;
        }

        for (const value of valuesToDelete) {
          const index = values.indexOf(value);
          if (index > -1) {
            values.splice(index, 1);
          }

          if (values.length === 0) {
            delete obj[key]; // Delete property if no values remain
          } else {
            obj[key] = values;
          }
        }
      }
    }

    return obj;
  },

  /**
   * Delete properties of an object.
   *
   * @function deleteProperties
   * @param {Object} obj Object to update
   * @param {Array} deletions Properties to delete
   * @return {Object} Updated object
   */
  deleteProperties(obj, deletions) {
    for (const key of deletions) {
      delete obj[key];
    }

    return obj;
  },

  /**
   * Derive additional file name properties.
   *
   * @function deriveFileProperties
   * @example deriveFileProperties('brighton-pier.jpg') => {
   *   originalname: 'brighton-pier.jpg',
   *   filedate: '2019-03-03T05:07:09+00:00',
   *   filename: 'ds48s',
   *   fileext: '.jpg'
   * }
   * @param {Object} file Original file object
   * @return {Object} File properties
   */
  deriveFileProperties(file) {
    const basename = utils.createRandomString();
    const {ext} = fileType(file.buffer);
    return {
      originalname: file.originalname,
      filedate: DateTime.local().toISO(),
      filename: `${basename}.${ext}`,
      fileext: ext
    };
  },

  /**
   * Derive media type and returns equivalent IndieWeb post type.
   *
   * @function deriveMediaType
   * @example deriveMediaType('brighton-pier.jpg') => 'photo'
   * @param {Object} file Original file object
   * @return {String} Returns either 'photo', 'video' or audio
   */
  deriveMediaType(file) {
    const {mime} = fileType(file.buffer);

    if (mime.includes('audio/')) {
      return 'audio';
    }

    if (mime.includes('image/')) {
      return 'photo';
    }

    if (mime.includes('video/')) {
      return 'video';
    }

    return null;
  },

  /**
   * Derive a permalink (by combining publication URL, that may include a
   * path, with the path to a post or file.
   *
   * @function derivePermalink
   * @example derivePermalink('http://foo.bar/baz', '/qux/quux') =>
   *   'http://foo.bar/baz/qux/quux'
   * @param {Object} url URL
   * @param {Object} pathname permalink path
   * @return {String} Returns either 'photo', 'video' or audio
   */
  derivePermalink(url, pathname) {
    url = new URL(url);
    let permalink = path.join(url.pathname, pathname);
    permalink = new URL(permalink, url);

    return permalink.href;
  },

  /**
   * Get first n words from a string.
   *
   * @function excerptString
   * @example excerptString('Foo bar baz', 2) => 'Foo bar'
   * @param {String} str String to excerpt
   * @param {Number} n Max number of words
   * @return {String} Excerpt
   */
  excerptString(str, n) {
    if (typeof str === 'string') {
      str = str.split(/\s+/).slice(0, n).join(' ');
      return str;
    }

    return null;
  },

  /**
   * Remove ‘/’ from beginning and end of string. Useful for constructing paths.
   *
   * @function normalizePath
   * @example normalizePath('/foo/bar/') => 'foo/bar'
   * @param {String} str Path to normalize
   * @return {String} Normalized path
   */
  normalizePath(str) {
    return str.replace(/^\/|\/$/g, '');
  },

  /**
   * Replace entries of a property. If property doesn’t exist, create it.
   *
   * @function replaceEntries
   * @param {Object} obj Object to update
   * @param {Object} replacements Properties to replace
   * @return {Object} Updated object
   */
  replaceEntries(obj, replacements) {
    for (const key in replacements) {
      if (Object.prototype.hasOwnProperty.call(replacements, key)) {
        const value = replacements[key];
        obj = _.set(obj, key, value);
      }
    }

    return obj;
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

    env.addFilter('date', (date, format) => {
      return DateTime.fromISO(date).toFormat(format);
    });

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
