const {ServerError, utils} = require('@indiekit/support');
const createData = require('./create-data');

/**
 * Upload a media file.
 *
 * @param {Object} req Request
 * @param {Object} file File
 * @param {Object} media Media data store
 * @returns {Object} Media data record
 */
module.exports = async (req, file, media) => {
  try {
    if (!file || file.truncated || !file.buffer) {
      throw new Error('No file included in request');
    }

    // Publication
    const {pub} = req.app.locals;
    const pubConfig = pub ? await pub.getConfig() : false;

    if (!pubConfig) {
      throw new Error('Publication config not found');
    }

    // Post type
    const type = utils.deriveMediaType(file);
    const typeConfig = pubConfig['post-types'][type];

    // Derive properties
    const properties = utils.deriveFileProperties(file);

    // Render publish path and public url
    let path = utils.render(typeConfig.media.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.media.url || typeConfig.media.path, properties);
    url = utils.derivePermalink(pubConfig.url, url);

    // Upload media file
    const {publisher} = pubConfig;
    const message = `:framed_picture: Uploaded ${type}`;
    const response = await publisher.createFile(path, file.buffer, message);

    // Return media data
    if (response) {
      const mediaData = createData(type, path, url);
      media = utils.addToArray(media, mediaData);
      return mediaData;
    }
  } catch (error) {
    throw new ServerError('Invalid request', 400, error.message);
  }
};
