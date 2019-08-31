const NodeCache = require('node-cache');

module.exports = new NodeCache({
  stdTTL: process.env.INDIEKIT_CACHE_EXPIRES + 30 // Minimum TTL is 30 seconds
});
