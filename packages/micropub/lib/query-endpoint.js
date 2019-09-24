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
module.exports = async (req, posts) => {
  try {
    const {query} = req;

    // Publication
    const {pub} = req.app.locals;
    const pubConfig = pub ? await pub.queryConfig() : false;

    if (!pubConfig) {
      throw new Error('Publication config not found');
    }

    if (!query) {
      throw new Error('Request is missing query string');
    }

    if (!query.q) {
      throw new Error('Invalid query');
    }

    switch (query.q) {
      case 'config': {
        return pubConfig;
      }

      case 'category': {
        return {
          categories: pubConfig.categories
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
        if (pubConfig[query.q]) {
          // Return configured property if matches provided query
          return {
            [query.q]: pubConfig[query.q]
          };
        }

        throw new Error(`Invalid parameter: ${query.q}`);
      }
    }
  } catch (error) {
    throw new ServerError('Invalid request', 400, error.message);
  }
};
