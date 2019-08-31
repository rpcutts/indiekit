require('dotenv').config();

module.exports = ((opts = {
  token: process.env.GITHUB_TOKEN || console.warn('Missing GITHUB_TOKEN'),
  user: process.env.GITHUB_USER || console.warn('Missing GITHUB_USER'),
  repo: process.env.GITHUB_REPO || console.warn('Missing GITHUB_REPO'),
  branch: process.env.GITHUB_BRANCH || 'master'
}) => {
  return {
    createFile: (path, content, message) => {
      return require('./lib/create-file')(opts, path, content, message);
    },
    deleteFile: (path, message) => {
      return require('./lib/delete-file')(opts, path, message);
    },
    getContents: path => {
      return require('./lib/get-contents')(opts, path);
    },
    updateFile: (path, content, message) => {
      return require('./lib/update-file')(opts, path, content, message);
    }
  };
})();
