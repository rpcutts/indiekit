const debug = require('debug')('indiekit:support:getFile');
const fsp = require('fs').promises;
const os = require('os');
const path = require('path');

/**
 * Gets file from publisher and saves it to filesystem.
 *
 * @exports getFile
 * @param {Object} basepath Path to remote file
 * @param {Function} publisher Publishing function
 * @returns {String|Object} Cache value
 */
module.exports = async (basepath, publisher) => {
  const filePath = path.join(os.tmpdir(), basepath);
  let content;

  try {
    debug('Fetch %s from filesystem', filePath);
    content = await fsp.readFile(filePath, {encoding: 'utf-8'});
  } catch {
    debug('Fetch %s from publisher', filePath);
    content = await publisher.readFile(basepath).catch(error => {
      throw new Error(error.message);
    });

    fsp.writeFile(filePath, content);
  }

  return content;
};
