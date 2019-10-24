const debug = require('debug')('indiekit:micropub');
const HttpError = require('http-errors');
const utils = require('@indiekit/support');

const createPost = require('./create-post');
const deletePost = require('./delete-post');
const undeletePost = require('./undelete-post');
const updatePost = require('./update-post');
const uploadAttachments = require('./upload-attachments');

module.exports = async (req, store, pub) => {
  const {posts} = store;
  const {media} = store;
  const action = req.query.action || req.body.action;
  const url = req.query.url || req.body.url;

  if (action && url) {
    // If no post data has been recorded, throw error
    if (!posts) {
      return new HttpError(404, `Can’t ${action} post. No records found`);
    }

    // If no post data has been recorded for this URL, throw error
    const postData = posts.filter(post => post.url === url);
    if (postData === undefined) {
      return new HttpError(404, `Can’t ${action} post. No record found for ${url}`);
    }

    // Determine action to perform
    switch (action) {
      case 'delete': {
        const deleted = await deletePost(req, postData, pub).catch(error => {
          return new HttpError(500, error.message);
        });

        if (deleted) {
          debug('deleted', deleted);
          return {
            status: 200,
            success: 'delete',
            success_description: `Post deleted from ${url}`
          };
        }

        break;
      }

      case 'undelete': {
        const undeleted = await undeletePost(req, postData, pub).catch(error => {
          return new HttpError(500, error.message);
        });

        if (undeleted) {
          debug('undeleted', undeleted);
          return {
            location: undeleted.url,
            status: 200,
            success: 'delete_undelete',
            success_description: `Post undeleted from ${url}`
          };
        }

        break;
      }

      case 'update': {
        const updated = await updatePost(req, postData, posts, pub).catch(error => {
          return new HttpError(500, error.message);
        });

        if (updated) {
          debug('updated', updated);
          const hasUpdatedUrl = (url !== updated.url);
          return {
            location: updated.url,
            status: hasUpdatedUrl ? 201 : 200,
            success: 'update',
            success_description: hasUpdatedUrl ?
              `Post updated and moved to ${updated.url}` :
              `Post updated at ${url}`
          };
        }

        break;
      }

      default:
    }
  }

  const {body} = req;

  // Upload attached media and add its URL to respective body property
  const uploaded = await uploadAttachments(req, media).catch(error => {
    return new HttpError(500, error.message);
  });

  if (uploaded) {
    debug('uploaded', uploaded);
    for (const upload of uploaded) {
      const property = upload.type;
      body[property] = utils.addToArray(body[property], upload.url);
    }
  }

  // Create post
  const created = await createPost(req, posts, pub).catch(error => {
    return new HttpError(500, error.message);
  });
  console.log('created', created);

  if (created) {
    debug('created', created);
    return {
      location: created.url,
      status: 202,
      success: 'create_pending',
      success_description: `Post will be created at ${created.url}`
    };
  }
};
