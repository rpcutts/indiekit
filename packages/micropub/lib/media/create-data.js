/**
 * Create an object containing media file data.
 *
 * @param {String} type Media type
 * @param {String} path File path
 * @param {String} url File URL
 * @returns {Object} Media data
 */
module.exports = (type, path, url) => {
  return {
    type,
    path,
    url
  };
};
