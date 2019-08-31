/**
 * Create an object containing post data.
 *
 * @param {String} type Post type
 * @param {String} path Post path
 * @param {String} url Post URL
 * @param {Object} properties Post properties
 * @returns {Object} Post data
 */
module.exports = (type, path, url, properties) => {
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
