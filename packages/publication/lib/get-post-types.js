/**
 * Returns an array of supported post types for endpoint query.
 *
 * @exports getPostTypes
 * @param {String} postTypeConfig Publication post type config
 * @returns {Array} Array of post types
 */
module.exports = postTypeConfig => {
  const postTypes = [];

  if (postTypeConfig) {
    for (const [key, value] of Object.entries(postTypeConfig)) {
      const postType = {
        type: key,
        name: value.name
      };
      postTypes.push(postType);
    }
  }

  return postTypes;
};
