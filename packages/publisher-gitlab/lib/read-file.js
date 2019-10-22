const {Gitlab} = require('gitlab');

/**
 * @typedef Response
 * @property {Object} response
 * @see {@link
    https://docs.gitlab.com/ee/api/repository_files.html#get-file-from-repository
    GitLab Docs: Repository files API - Get file from repository
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
  const gitlab = new Gitlab({
    host: opts.instance,
    token: opts.token
  });

  const response = await gitlab.RepositoryFiles.show(
    opts.projectId,
    path,
    opts.branch
  ).catch(error => {
    throw new Error(error);
  });

  const content = Buffer.from(response.content, 'base64').toString('utf8');
  return content;
};
