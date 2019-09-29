const {Gitlab} = require('gitlab');

/**
 * @typedef Response
 * @property {Object} response
 * @see {@link
    https://developer.github.com/v3/repos/contents/#create-or-update-a-file
    GitHub REST API v3: Contents - Create or update a file
  }
 */

/**
 * Updates a file in a repository.
 *
 * @exports updateFile
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @param {String} content File content
 * @param {String} message Commit message
 * @return {Promise<Response>} HTTP response
 */
module.exports = async (opts, path, content, message) => {
  const gitlab = new Gitlab({
    host: opts.host,
    token: opts.token
  });

  content = Buffer.from(content).toString('base64');
  const response = await gitlab.RepositoryFiles.edit(
    opts.projectId,
    path,
    opts.branch,
    content,
    message, {
      encoding: 'base64'
    }
  ).catch(error => {
    throw new Error(error);
  });

  return response;
};
