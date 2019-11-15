const application = require('./../models/application');
const publisher = require('./../models/publisher');

module.exports = (async () => {
  const {publisherId} = await application.getAll();
  const Publisher = require(`@indiekit/publisher-${publisherId}`);
  const publisherConfig = await publisher(publisherId).getAll();

  return new Publisher(publisherConfig);
})();
