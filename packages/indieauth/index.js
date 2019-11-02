const authorizeRequest = require('./lib/authorize-request');
const checkTokenScope = require('./lib/check-token-scope');

const defaults = {
  me: '',
  token: '',
  tokenEndpoint: 'https://tokens.indieauth.com/token'
};

class IndieAuth {
  constructor(opts = {}) {
    this.opts = Object.assign(defaults, {...opts});
    this.authorize = this.authorize.bind(this);
    this.checkScope = this.checkScope.bind(this);
  }

  // Authorize request
  async authorize(req, res, next) {
    const verifiedToken = await authorizeRequest(this.opts, req).catch(error => {
      return next(error);
    });
    this.opts.token = verifiedToken;
    return next();
  }

  // Check scope
  checkScope(requiredScope) {
    return checkTokenScope(this.opts, requiredScope);
  }
}

module.exports = IndieAuth;
