const httpError = require('http-errors');
const {utils} = require('@indiekit/support');
const dataFormat = require('./../utils/data-format');
const derive = require('./../utils/derive');

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

    // Post type
    const type = derive.mediaType(file);
    const typeConfig = pub['post-type-config'][type];

    // Derive properties
    const properties = derive.fileData(file);

    // Render publish path and public url
    const path = utils.render(typeConfig.media.path, properties);
    let url = utils.render(typeConfig.media.url || typeConfig.media.path, properties);
    url = derive.permalink(pub.url, url);

    // Upload media file
    const {publisher} = pub;
    const message = `:framed_picture: Uploaded ${type}`;
    const response = await publisher.createFile(path, file.buffer, message);

    // Return media data
    if (response) {
      const mediaData = dataFormat.media(type, path, url);
      media = utils.addToArray(media, mediaData);
      return mediaData;
    }
  } catch (error) {
    throw new httpError.BadRequest(error.message);
  }
};
