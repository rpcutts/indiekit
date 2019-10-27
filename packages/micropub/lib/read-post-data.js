/**
 * Reads a post data object.
 *
 * @exports readPostData
 * @param {Object} postStore Record of published posts
 * @param {Object} url URL of published post
 * @returns {Object} postData
 */
module.exports = (postStore, url) => {
  // If no post data has been recorded, throw error
  if (!postStore) {
    return new Error('No records found');
  }

  // If no post data has been recorded for this URL, throw error
  const postData = postStore.filter(post => post.url === url);
  if (postData === undefined) {
    return new Error(`No record found for ${url}`);
  }

  return postData;
};
