const uploadMedia = require('./media/upload-media');

/**
 * Upload attached media files and return mediaData object.
 *
 * @param {Object} req Request
 * @param {Object} media Media data store
 * @param {Object} pub Publication settings
 * @returns {Object} Media data
 */
module.exports = async (req, media, pub) => {
  const {files} = req;

  if (files && files.length > 0) {
    const uploads = [];
    for (const file of files) {
      const upload = uploadMedia(req, file, media, pub);
      uploads.push(upload);
    }

    return Promise.all(uploads);
  }
};
