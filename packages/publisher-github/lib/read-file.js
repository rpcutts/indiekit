const Octokit = require('@octokit/rest');

/**
 * @typedef Content
 * @property {String} content
 * @see {@link
    https://developer.github.com/v3/repos/contents/#get-contents
    GitHub REST API v3: Contents - Get contents
  }
 */

/**
 * Reads a file in a repository.
 *
 * @exports readFile
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @return {Promise<Response>} HTTP response
 */
module.exports = async (opts, path) => {
  const github = new Octokit({
    auth: `token ${opts.token}`
  });

  const response = await github.repos.getContents({
    owner: opts.user,
    repo: opts.repo,
    ref: opts.branch,
    path
  }).catch(error => {
    throw new Error(error);
  });

  const content = Buffer.from(response.data.content, 'base64').toString('utf8');
  return content;
};
