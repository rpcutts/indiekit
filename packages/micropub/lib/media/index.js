const generateData = require('./create-data');
const formatMessage = require('./../utils/format-message');

module.exports = opts => {
  const module = {};
  const {config, mediaStore, publisher} = opts;

  // Upload media
  module.upload = async (req, file) => {
    const mediaData = await generateData(req, file, config);
    const {path} = mediaData;
    const message = formatMessage('upload', mediaData, config);
    const published = await publisher.createFile(path, file.buffer, message);

    if (published) {
      await mediaStore.set(mediaData.url, mediaData);
      return {
        location: mediaData.url,
        status: 201,
        success: 'create',
        success_description: `Media saved to ${mediaData.url}`
      };
    }
  };

  return module;
};
