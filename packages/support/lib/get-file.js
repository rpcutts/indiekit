const cache = require('./cache');
const utils = require('./utils');

/**
 * Gets file from publisher and saves it to cache.
 *
 * @exports getFile
 * @param {Object} path Path to remote file
 * @param {Function} publisher Publishing function
 * @returns {String|Object} Cache value
 */
module.exports = async (path, publisher) => {
  path = utils.normalizePath(path);
  let value;

  try {
    // Fetch from cache
    value = cache.get(path, true);
  } catch (error) {
    // Fetch from publisher
    const contents = await publisher.getContents(path).catch(() => {
      throw new Error(`${path} could not be found in the cache or at the specified remote location`);
    });

    value = contents.data.content;
    cache.set(path, value);
  }

  return value;
};
