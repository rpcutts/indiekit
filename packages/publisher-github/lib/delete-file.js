const Octokit = require('@octokit/rest');

/**
 * @typedef Response
 * @property {Object} response
 * @see {@link
    https://developer.github.com/v3/repos/contents/#delete-a-file
    GitHub REST API v3: Contents - Delete a file
  }
 */

/**
 * Deletes a file in a repository.
 *
 * @exports deleteFile
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @param {String} message Commit message
 * @return {Promise<Response>} HTTP response
 */
module.exports = async (opts, path, message) => {
  const github = new Octokit({
    auth: `token ${opts.token}`
  });

  const contents = await github.repos.getContents({
    owner: opts.user,
    repo: opts.repo,
    ref: opts.branch,
    path
  }).catch(error => {
    throw new Error(error);
  });

  const response = await github.repos.deleteFile({
    owner: opts.user,
    repo: opts.repo,
    branch: opts.branch,
    sha: contents.data.sha,
    message,
    path
  }).catch(error => {
    throw new Error(error);
  });

  return response;
};
