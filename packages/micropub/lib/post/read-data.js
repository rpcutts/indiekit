/**
 * Return post data object.
 *
 * @exports readData
 * @param {Object} postStore Record of published posts
 * @param {Object} url URL of published post
 * @returns {Object} postData
 */
module.exports = async (postStore, url) => {
  // Throw error if no post store
  if (!postStore) {
    throw new Error('No records found');
  }

  // Throw error if no post data recorded for given URL
  const postData = await postStore.get(url);
  if (!postData) {
    throw new Error(`No record found for ${url}`);
  }

  // Reurn post data
  return postData;
};
