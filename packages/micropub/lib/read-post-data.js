/**
 * Return post data object.
 *
 * @exports readPostData
 * @param {Object} postStore Record of published posts
 * @param {Object} url URL of published post
 * @returns {Object} postData
 */
module.exports = (postStore, url) => {
  // Throw error if no post store
  if (!postStore) {
    throw new Error('No records found');
  }

  // Throw error if no post data recorded for given URL
  const postData = postStore.filter(post => post.url === url);
  if (postData.length === 0) {
    throw new Error(`No record found for ${url}`);
  }

  // Reurn post data
  return postData[0];
};
