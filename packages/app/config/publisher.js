const debug = require('debug')('indiekit:micropub');
const application = require('./../models/application');
const publisher = require('./../models/publisher');

module.exports = async () => {
  try {
    // const {publisherId} = await application.getAll();
    // const Publisher = require(`@indiekit/publisher-${publisherId}`);
    // const publisherConfig = await publisher(publisherId).getAll();
    //
    // return new Publisher(publisherConfig);
  } catch (error) {
    debug('ERROR', error);
  }
};
