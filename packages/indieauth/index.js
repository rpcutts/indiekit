module.exports = {
  authenticate: require('./lib/authenticate'),
  middleware: require('./lib/middleware'),
  checkTokenScope: require('./lib/check-token-scope'),
  requestToken: require('./lib/request-token'),
  verifyToken: require('./lib/verify-token')
};
