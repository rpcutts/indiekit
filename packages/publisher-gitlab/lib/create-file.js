const {Gitlab} = require('gitlab');

/**
 * @typedef Response
 * @property {Object} response
 * @see {@link
    https://docs.gitlab.com/ee/api/repository_files.html#create-new-file-in-repository
    GitLab Docs: Repository files API - Create new file in repository
  }
 */

/**
 * Creates a file in a repository.
 *
 * @exports createFile
 * @param {Object} opts Module options
 * @param {String} path Path to file
 * @param {String} content File content
 * @param {String} message Commit message
 * @return {Promise<Response>} HTTP response
 */
module.exports = async (opts, path, content, message) => {
  const gitlab = new Gitlab({
    host: opts.instance,
    token: opts.token
  });

  content = Buffer.from(content).toString('base64');
  const response = await gitlab.RepositoryFiles.create(
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
