const express = require('express');
const multer = require('multer');
const IndieAuth = require('@indiekit/indieauth');
const utils = require('@indiekit/support');

const formatCommitMessage = ('./utils/format-commit-message');

const createMediaData = require('./lib/create-media-data');
const createPostData = require('./lib/create-post-data');
const createPostContent = require('./lib/create-post-content');
const readPostData = require('./lib/read-post-data');
const queryEndpoint = require('./lib/query-endpoint');
const queryMediaEndpoint = require('./lib/query-media-endpoint');
const updatePostData = require('./lib/update-post-data');

/**
 * Express middleware function for Micropub endpoint.
 *
 * @param {Object} opts Module options
 * @returns {Object} Express middleware
 */
module.exports = opts => {
  const {config, publisher, store} = opts;
  const mediaStore = store.media;
  const postStore = store.posts;

  // Create new Express router
  const router = new express.Router({
    caseSensitive: true,
    mergeParams: true
  });

  // Parse application/json requests
  const jsonParser = express.json({
    limit: '10mb'
  });

  // Parse multipart/form-data requests
  const multipartParser = multer({
    storage: multer.memoryStorage()
  });

  // Parse application/x-www-form-urlencoded requests
  const urlencodedParser = express.urlencoded({
    extended: true,
    limit: '10mb'
  });

  // Configure IndieAuth middleware
  const indieauth = new IndieAuth({
    me: config.me
  });

  // Delete post
  const deletePost = async postData => {
    const authorized = indieauth.checkScope('delete');
    const message = formatCommitMessage('delete', postData, config);
    const published = await publisher.deleteFile(postData.path, message);

    if (authorized && published) {
      return {
        status: 200,
        success: 'delete',
        success_description: `Post deleted from ${postData.url}`
      };
    }
  };

  // Undelete post
  const undeletePost = async postData => {
    const authorized = indieauth.checkScope('create');
    const postContent = await createPostContent(postData, config);
    const message = formatCommitMessage('undelete', postData, config);
    const published = await publisher.createFile(postData.path, postContent, message);

    if (authorized && published) {
      return {
        location: postData.url,
        status: 200,
        success: 'delete_undelete',
        success_description: `Post undeleted from ${postData.url}`
      };
    }
  };

  // Update post
  const updatePost = async (req, url, postData) => {
    const authorized = indieauth.checkScope('update');
    postData = await updatePostData(req, postData, config);
    const postContent = await createPostContent(postData, config);
    const message = formatCommitMessage('update', postData, config);
    const published = await publisher.updateFile(postData.path, postContent, message);

    if (authorized && published) {
      // TODO: Check existing record gets updated with new data
      utils.addToArray(postStore, postData);
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

  // Upload media
  const uploadMedia = async (req, file, mediaStore) => {
    const authorized = indieauth.checkScope('create');
    const mediaData = await createMediaData(req, file, config);
    const {path} = mediaData;
    const message = formatCommitMessage('upload', mediaData, config);
    const published = await publisher.createFile(path, file.buffer, message);

    if (authorized && published) {
      utils.addToArray(mediaStore, mediaData);
      return {
        location: mediaData.url,
        status: 201,
        success: 'create',
        success_description: `Media saved to ${mediaData.url}`
      };
    }
  };

  // Create post
  const createPost = async req => {
    const authorized = indieauth.checkScope('create');
    const {body} = req;
    const {files} = req;

    // Upload attached media and add its URL to respective body property
    if (files && files.length > 0) {
      const uploads = [];
      for (const file of files) {
        const upload = uploadMedia(req, file, mediaStore);
        uploads.push(upload);
      }

      const uploaded = Promise.all(uploads);

      for (const upload of uploaded) {
        const property = upload.type;
        body[property] = utils.addToArray(body[property], upload.url);
      }
    }

    // Create post
    const postData = await createPostData(req, config);
    const postContent = await createPostContent(postData, config);
    const message = formatCommitMessage('create', postData, config);
    const published = await publisher.createFile(postData.path, postContent, message);
    if (authorized && published) {
      utils.addToArray(postStore, postData);
      return {
        location: postData.url,
        status: 202,
        success: 'create_pending',
        success_description: `Post will be created at ${postData.url}`
      };
    }
  };

  // Query endpoint
  router.get('/', urlencodedParser, async (req, res, next) => {
    try {
      const response = await queryEndpoint(req, postStore, config);
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  });

  // Query media endpoint
  router.get('/media', urlencodedParser, (req, res, next) => {
    try {
      const response = queryMediaEndpoint(req, mediaStore);
      return res.json(response);
    } catch (error) {
      return next(error);
    }
  });

  // Create/update/delete/undelete post
  router.post('/media',
    indieauth.authorize,
    multipartParser.any(),
    jsonParser,
    urlencodedParser,
    async (req, res, next) => {
      const action = req.query.action || req.body.action;
      const url = req.query.url || req.body.url;

      let response;
      try {
        if (action && url) {
          const postData = readPostData(postStore, url);
          switch (action) {
            case 'delete': {
              response = deletePost(postData);
              break;
            }

            case 'undelete': {
              response = undeletePost(postData);
              break;
            }

            case 'update': {
              response = updatePost(req, url, postData);

              break;
            }

            default:
          }
        }

        response = createPost(req);

        if (response) {
          res.header('Location', response.location);
          return res.status(response.status).json({
            success: response.success,
            success_description: response.success_description
          });
        }
      } catch (error) {
        return next(error);
      }
    }
  );

  // Upload media
  router.post('/media',
    indieauth.authorize,
    multipartParser.single('file'),
    async (req, res, next) => {
      const {file} = req;
      try {
        const response = uploadMedia(req, file, mediaStore);
        if (response) {
          res.header('Location', response.location);
          return res.status(response.status).json({
            success: response.success,
            success_description: response.success_description
          });
        }
      } catch (error) {
        return next(error);
      }
    }
  );

  return router;
};
