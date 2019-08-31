const uploadMedia = require('./media/upload-media');

/**
 * Upload attached media files and return mediaData object.
 *
 * @param {Object} req Request
 * @param {Object} media Media data store
 * @returns {Object} Media data
 */
module.exports = async (req, media) => {
  const {files} = req;

  if (files && files.length > 0) {
    const uploads = [];
    for (const file of files) {
      const upload = uploadMedia(req, file, media);
      uploads.push(upload);
    }

    return Promise.all(uploads);
  }
};
