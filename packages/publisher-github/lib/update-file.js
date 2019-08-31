const Octokit = require('@octokit/rest');

/**
 * Updates a file in a GitHub repository.
 *
 * @exports updateFile
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @param {String} content File content
 * @param {String} message Commit message
 * @return {Promise} GitHub HTTP response
 */
module.exports = async (opts, path, content, message) => {
  const octokit = new Octokit({
    auth: `token ${opts.token}`
  });

  const contents = await octokit.repos.getContents({
    owner: opts.user,
    repo: opts.repo,
    ref: opts.branch,
    path
  }).catch(() => {
    return false;
  });

  content = Buffer.from(content).toString('base64');
  const updatedFile = await octokit.repos.createOrUpdateFile({
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

  return updatedFile;
};
