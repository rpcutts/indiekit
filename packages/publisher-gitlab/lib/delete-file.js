const {Gitlab} = require('gitlab');

/**
 * @typedef Response
 * @property {Boolean} response True if the request succeeded
 * @see {@link
    https://docs.gitlab.com/ee/api/repository_files.html#delete-existing-file-in-repository
    GitLab Docs: Repository files API - Delete existing file in repository
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
  const gitlab = new Gitlab({
    host: opts.instance,
    token: opts.token
  });

  try {
    await gitlab.RepositoryFiles.remove(
      opts.projectId,
      path,
      opts.branch,
      message
    );
    return true;
  } catch (error) {
    throw new Error(error);
  }
};
