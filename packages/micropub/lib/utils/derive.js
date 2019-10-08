const path = require('path');
const {DateTime} = require('luxon');
const fileType = require('file-type');
const postTypeDiscovery = require('post-type-discovery');
const slugify = require('slug');
const {utils} = require('@indiekit/support');

/**
 * Generate random alpha-numeric string, 5 characters long.
 *
 * @private
 * @function createRandomString
 * @example createRandomString() => 'b3dog'
 * @return {Object} Alpha-numeric string
 */
function createRandomString() {
  return (Number(new Date())).toString(36).slice(-5);
}

/**
 * Get first n words from a string.
 *
 * @private
 * @function excerptString
 * @example excerptString('Foo bar baz', 2) => 'Foo bar'
 * @param {String} str String to excerpt
 * @param {Number} n Max number of words
 * @return {String} Excerpt
 */
function excerptString(str, n) {
  if (typeof str === 'string') {
    str = str.split(/\s+/).slice(0, n).join(' ');
    return str;
  }

  return null;
}

/**
 * Derive content (HTML, else object value, else property value).
 *
 * @exports content
 * @param {Object} mf2 microformats2 object
 * @returns {Array} Content
 */
const content = mf2 => {
  let {content} = mf2.properties;

  if (content) {
    content = content[0].html || content[0].value || content[0];
    return new Array(content);
  }

  return null;
};

/**
 * Derive additional properties from file data.
 *
 * @function fileData
 * @example fileData('brighton-pier.jpg') => {
 *   originalname: 'brighton-pier.jpg',
 *   filedate: '2019-03-03T05:07:09+00:00',
 *   filename: 'ds48s',
 *   fileext: '.jpg'
 * }
 * @param {Object} file Original file object
 * @return {Object} File properties
 */
const fileData = file => {
  const basename = createRandomString();
  const {ext} = fileType(file.buffer);
  return {
    originalname: file.originalname,
    filedate: DateTime.local().toISO(),
    filename: `${basename}.${ext}`,
    fileext: ext
  };
};

/**
 * Derive a permalink (by combining publication URL, that may include a
 * path, with the path to a post or file.
 *
 * @function permalink
 * @example permalink('http://foo.bar/baz', '/qux/quux') =>
 *   'http://foo.bar/baz/qux/quux'
 * @param {Object} url URL
 * @param {Object} pathname permalink path
 * @return {String} Returns either 'photo', 'video' or audio
 */
const permalink = (url, pathname) => {
  url = new URL(url);
  let permalink = path.join(url.pathname, pathname);
  permalink = new URL(permalink, url);

  return permalink.href;
};

/**
 * Combine referenced and attached photos into one object which can be used in
 * a microformats2 object. Attached photos are uploaded to GitHub.
 *
 * @exports photo
 * @param {Object} mf2 microformats2 object
 * @returns {Promise} Array of photo obejcts
 */
const photo = async mf2 => {
  const photos = [];
  const {photo} = mf2.properties;

  // Ensures property is consistently formatted as an array of objects
  if (photo) {
    photo.forEach(item => {
      if (typeof item === 'object') {
        photos.push(item);
      } else {
        photos.push({
          value: item
        });
      }
    });
  }

  return photos;
};

/**
 * Derive published date (based on microformats2 data, else the current date).
 *
 * @exports published
 * @param {Object} mf2 microformats2 object
 * @param {Object} locale Locale to use for formatting datetime
 * @returns {Array} Array containing ISO formatted date
 */
const published = (mf2, locale = 'en-GB') => {
  let {published} = mf2.properties;
  const now = DateTime.local().toISO();

  if (published) {
    published = DateTime.fromISO(published[0], {
      locale,
      zone: 'utc'
    }).toISO();
    return new Array(published);
  }

  return new Array(now);
};

/**
 * Derive slug (using `mp-slug` value, slugified name else a random number).
 *
 * @exports slug
 * @param {Object} mf2 microformats2 object
 * @param {String} separator Slug separator
 * @returns {Array} Array containing slug value
 */
const slug = (mf2, separator) => {
  // Use provided slug…
  let {slug} = mf2.properties;
  if (slug && slug[0] !== '') {
    return slug;
  }

  // …else, slugify name…
  const {name} = mf2.properties;
  if (name && name[0] !== '') {
    const excerpt = excerptString(name[0], 5);
    slug = slugify(excerpt, {
      replacement: separator,
      lower: true
    });
    slug = new Array(slug);

    return slug;
  }

  // …else, failing that, create a random string
  const random = createRandomString();
  slug = new Array(random);

  return slug;
};

/**
 * Derive media type (and return equivalent IndieWeb post type).
 *
 * @function mediaType
 * @example mediaType('brighton-pier.jpg') => 'photo'
 * @param {Object} file File object
 * @return {String} Post type ('photo', 'video' or 'audio')
 */
const mediaType = file => {
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
};

/**
 * Derive post type
 *
 * @exports postType
 * @param {Object} mf2 microformats2 object
 * @returns {String} Post type
 */
const postType = mf2 => {
  return postTypeDiscovery(mf2);
};

module.exports = {
  content,
  fileData,
  permalink,
  photo,
  published,
  slug,
  mediaType,
  postType
};
