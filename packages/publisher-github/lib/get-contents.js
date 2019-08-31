const Octokit = require('@octokit/rest');

/**
 * Reads contents of a file or directory in a repository.
 *
 * @exports getContents
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @return {String} Base64 decoded file contents
 * @return {Boolean} Returns false if contents cannot be found
 */
module.exports = async (opts, path) => {
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

  contents.data.content = Buffer.from(contents.data.content, 'base64').toString('utf8');
  return contents;
};
