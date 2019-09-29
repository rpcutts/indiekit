const fsp = require('fs').promises;
const os = require('os');
const path = require('path');
const utils = require('./utils');

/**
 * Gets file from publisher and saves it to filesystem.
 *
 * @exports getFile
 * @param {Object} basepath Path to remote file
 * @param {Function} publisher Publishing function
 * @returns {String|Object} Cache value
 */
module.exports = async (basepath, publisher) => {
  basepath = utils.normalizePath(basepath);
  const filePath = path.join(os.tmpdir(), basepath);
  let content;

  try {
    // Fetch from filesystem
    content = await fsp.readFile(filePath, {encoding: 'utf-8'});
  } catch {
    // Fetch from publisher
    content = await publisher.readFile(basepath).catch(error => {
      throw new Error(error.message);
    });

    fsp.writeFile(filePath, content);
  }

  return content;
};
