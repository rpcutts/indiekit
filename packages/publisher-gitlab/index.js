module.exports = class {
  constructor(opts) {
    this.opts = opts;
    this.opts.branch = opts.branch || 'master';
    this.opts.instance = opts.instance || 'https://gitlab.com';
    this.opts.projectId = opts.projectId || `${opts.user}/${opts.repo}`;
  }

  createFile(path, content, message) {
    return require('./lib/create-file')(this.opts, path, content, message);
  }

  deleteFile(path, message) {
    return require('./lib/delete-file')(this.opts, path, message);
  }

  readFile(path) {
    return require('./lib/read-file')(this.opts, path);
  }

  updateFile(path, content, message) {
    return require('./lib/update-file')(this.opts, path, content, message);
  }
};
