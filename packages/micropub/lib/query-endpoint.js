const microformats = require('@indiekit/microformats');
const {ServerError} = require('@indiekit/support');

/**
 * Express middleware function for querying Micropub endpoint.
 *
 * @param {Object} req Request
 * @param {Object} posts Published posts
 * @param {Object} config Publication config
 * @returns {Object} Requested information
 */
module.exports = async (req, posts, config) => {
  const {query} = req;
  try {
    if (!config) {
      throw new Error('Configuration not available');
    }

    if (!query) {
      throw new Error('Request is missing query string');
    }

    if (!query.q) {
      throw new Error('Invalid query');
    }

    switch (query.q) {
      case 'config': {
        return config;
      }

      case 'category': {
        return {
          categories: config.categories
        };
      }

      case 'source': {
        if (query.url) {
          // Return source (as mf2 object) for given URL
          return microformats.urlToMf2(query.url, query.properties).catch(error => {
            throw new Error(error.message);
          });
        }

        // Return list of previously published posts
        return (posts ? {
          items: posts.map(post => {
            return post.mf2;
          })
        } : {});
      }

      default: {
        if (config[query.q]) {
          // Return configured property if matches provided query
          return {
            [query.q]: config[query.q]
          };
        }

        throw new Error(`Invalid parameter: ${query.q}`);
      }
    }
  } catch (error) {
    throw new ServerError('Invalid request', 400, error.message);
  }
};
