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
    // Publication
    const {pub} = req.app.locals;
    const pubConfig = pub ? await pub.getConfig() : false;

    if (!pubConfig) {
      throw new Error('Publication config not found');
    }

    // Post type
    const {type} = postData;

    // Get publish path
    const path = utils.normalizePath(postData.path);

    // Delete post file
    const {publisher} = pubConfig;
    const message = `:x: Deleted ${type} post`;
    const response = await publisher.deleteFile(path, message);

    // Return
    if (response) {
      return true;
    }
  } catch (error) {
    throw new Error(error);
  }
};
