/**
 * Deletes a post.
 *
 * @param {Object} req Request
 * @param {Object} postData Stored post data object
 * @param {Object} pub Publication settings
 * @returns {Boolean} True if post is deleted
 */
module.exports = async (req, postData, pub) => {
  try {
    // Post type
    const {type} = postData;

    // Get publish path
    const {path} = postData;

    // Delete post file
    const {publisher} = pub;
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
