const Octokit = require('@octokit/rest');

/**
 * Creates a new file in a GitHub repository.
 *
 * @exports createFile
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

  content = Buffer.from(content).toString('base64');
  const createdFile = await octokit.repos.createOrUpdateFile({
    owner: opts.user,
    repo: opts.repo,
    branch: opts.branch,
    message,
    path,
    content
  }).catch(error => {
    throw new Error(error);
  });

  return createdFile;
};
