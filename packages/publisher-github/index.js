module.exports = class {
  constructor(opts) {
    this.opts = opts;
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
