const httpError = require('http-errors');

/**
 * Express middleware function for querying Micropub media endpoint.
 *
 * @param {Object} req Request
 * @param {Object} media Uploaded media
 * @returns {Object} Requested information
 */
module.exports = (req, media) => {
  const {query} = req;
  try {
    if (!query) {
      throw new Error('Request is missing query string');
    }

    if (!query.q) {
      throw new Error('Invalid query');
    }

    switch (query.q) {
      case 'last': {
        return (media ? {
          url: media[media.length - 1].url
        } : {});
      }

      default: {
        throw new Error(`Invalid parameter: ${query.q}`);
      }
    }
  } catch (error) {
    throw new httpError.BadRequest(error.message);
  }
};
