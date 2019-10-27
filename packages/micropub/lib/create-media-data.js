const utils = require('@indiekit/support');
const derive = require('./utils/derive');

/**
 * Create media data object.
 *
 * @param {Object} req Request
 * @param {Object} file File
 * @param {Object} pub Publication settings
 * @returns {Object} Media data
 */
module.exports = async (req, file, pub) => {
  try {
    if (!file || file.truncated || !file.buffer) {
      throw String('No file included in request');
    }

    // Media type
    const type = derive.mediaType(file);
    const typeConfig = pub['post-type-config'][type];

    // Derive properties
    const properties = derive.fileData(file);

    // Render publish path and public url
    const path = utils.render(typeConfig.media.path, properties);
    let url = utils.render(typeConfig.media.url || typeConfig.media.path, properties);
    url = derive.permalink(pub.me, url);

    // Return media data
    const mediaData = {
      type,
      path,
      url
    };
    return mediaData;
  } catch (error) {
    throw new Error(error);
  }
};
