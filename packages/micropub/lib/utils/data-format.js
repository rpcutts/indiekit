/**
 * Create an object containing media file data.
 *
 * @exports media
 * @param {String} type Media type
 * @param {String} path File path
 * @param {String} url File URL
 * @returns {Object} Media data
 */
const media = (type, path, url) => {
  return {
    type,
    path,
    url
  };
};

/**
 * Create an object containing post data.
 *
 * @exports post
 * @param {String} type Post type
 * @param {String} path Post path
 * @param {String} url Post URL
 * @param {Object} properties Post properties
 * @returns {Object} Post data
 */
const post = (type, path, url, properties) => {
  return {
    type,
    path,
    url,
    mf2: {
      type: (type === 'event') ? ['h-event'] : ['h-entry'],
      properties
    }
  };
};

module.exports = {
  media,
  post
};
