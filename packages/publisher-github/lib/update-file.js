const Octokit = require('@octokit/rest');

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
  const github = new Octokit({
    auth: `token ${opts.token}`
  });

  const contents = await github.repos.getContents({
    owner: opts.user,
    repo: opts.repo,
    ref: opts.branch,
    path
  }).catch(() => {
    return false;
  });

  content = Buffer.from(content).toString('base64');
  const response = await github.repos.createOrUpdateFile({
    owner: opts.user,
    repo: opts.repo,
    branch: opts.branch,
    sha: (contents) ? contents.data.sha : false,
    message,
    path,
    content
  }).catch(error => {
    throw new Error(error);
  });

  return response;
};
