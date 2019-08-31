const Octokit = require('@octokit/rest');

/**
 * Deletes a file in a GitHub repository.
 *
 * @exports deleteFile
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @param {String} message Commit message
 * @return {Promise} GitHub HTTP response
 */
module.exports = async (opts, path, message) => {
  const octokit = new Octokit({
    auth: `token ${opts.token}`
  });

  const contents = await octokit.repos.getContents({
    owner: opts.user,
    repo: opts.repo,
    ref: opts.branch,
    path
  }).catch(error => {
    throw new Error(error);
  });

  const deletedFile = await octokit.repos.deleteFile({
    owner: opts.user,
    repo: opts.repo,
    branch: opts.branch,
    sha: contents.data.sha,
    message,
    path
  }).catch(error => {
    throw new Error(error);
  });

  return deletedFile;
};
