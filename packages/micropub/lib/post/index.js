const debug = require('debug')('indiekit:micropub');
const utils = require('@indiekit/support');

const createData = require('./create-data');
const createContent = require('./create-content');
const updateData = require('./update-data');
const media = require('./../media');
const formatMessage = require('./../utils/format-message');

module.exports = opts => {
  const module = {};
  const {config, postStore, publisher} = opts;

  // Delete post
  module.delete = async postData => {
    const message = formatMessage('delete', postData, config);
    const published = await publisher.deleteFile(postData.path, message);

    if (published) {
      return {
        status: 200,
        success: 'delete',
        success_description: `Post deleted from ${postData.url}`
      };
    }
  };

  // Undelete post
  module.undelete = async postData => {
    const postContent = await createContent(postData, config);
    const message = formatMessage('undelete', postData, config);
    const published = await publisher.createFile(postData.path, postContent, message);

    if (published) {
      return {
        location: postData.url,
        status: 200,
        success: 'delete_undelete',
        success_description: `Post undeleted from ${postData.url}`
      };
    }
  };

  // Update post
  module.update = async (req, url, postData) => {
    postData = await updateData(req, postData, config);
    const postContent = await createContent(postData, config);
    const message = formatMessage('update', postData, config);
    const published = await publisher.updateFile(postData.path, postContent, message);

    if (published) {
      await postStore.set(postData.url, postData);
      const hasUpdatedUrl = (url !== postData.url);
      return {
        location: postData.url,
        status: hasUpdatedUrl ? 201 : 200,
        success: 'update',
        success_description: hasUpdatedUrl ?
          `Post updated and moved to ${postData.url}` :
          `Post updated at ${url}`
      };
    }
  };

  // Create post
  module.create = async req => {
    const {body} = req;
    const {files} = req;

    // Upload attached media and add its URL to respective body property
    if (files && files.length > 0) {
      const uploads = [];
      for (const file of files) {
        const upload = media.upload(req, file);
        uploads.push(upload);
      }

      const uploaded = Promise.all(uploads);

      for (const upload of uploaded) {
        const property = upload.type;
        body[property] = utils.addToArray(body[property], upload.url);
      }
    }

    // Create post
    const postData = await createData(req, config);
    const postContent = await createContent(postData, config);
    const message = formatMessage('create', postData, config);
    const published = await publisher.createFile(postData.path, postContent, message);

    if (published) {
      await postStore.set(postData.url, postData);
      return {
        location: postData.url,
        status: 202,
        success: 'create_pending',
        success_description: `Post will be created at ${postData.url}`
      };
    }
  };

  return module;
};
