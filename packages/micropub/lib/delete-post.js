const {utils} = require('@indiekit/support');

/**
 * Deletes a post.
 *
 * @param {Object} req Request
 * @param {Object} postData Stored post data object
 * @returns {Boolean} True if post is deleted
 */
module.exports = async (req, postData) => {
  try {
    const {pub} = req.app.locals;
    const {publisher} = pub;

    // Get type
    const {type} = postData;

    // Get publish path
    const path = utils.normalizePath(postData.path);

    // Compose commit message
    const message = `:x: Deleted ${type} post`;

    // Delete post file
    const response = await publisher.deleteFile(path, message);
    if (response) {
      return true;
    }
  } catch (error) {
    throw new Error(error);
  }
};
