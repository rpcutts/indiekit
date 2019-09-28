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
    const data = await fsp.readFile(filePath);
    content = Buffer.from(data).toString('utf-8');
  } catch {
    // Fetch from publisher
    const contents = await publisher.getContents(basepath).catch(error => {
      throw new Error(error.message);
    });
    content = contents.data.content;

    fsp.writeFile(filePath, content);
  }

  return content;
};
