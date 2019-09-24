const {ServerError, utils} = require('@indiekit/support');

const createPost = require('./create-post');
const deletePost = require('./delete-post');
const undeletePost = require('./undelete-post');
const updatePost = require('./update-post');
const uploadAttachments = require('./upload-attachments');

module.exports = async (req, posts, media) => {
  const action = req.query.action || req.body.action;
  const url = req.query.url || req.body.url;

  if (action && url) {
    // If no post data has been recorded, throw error
    if (!posts) {
      throw new ServerError('Not found', 404, 'No records found');
    }

    // If no post data has been recorded for this URL, throw error
    const postData = posts.filter(post => post.url === url);
    if (postData === undefined) {
      throw new ServerError('Not found', 404, `No record found for ${url}`);
    }

    // Determine action to perform
    switch (action) {
      case 'delete': {
        const deleted = await deletePost(req, postData).catch(error => {
          throw new Error(error.message);
        });

        if (deleted) {
          return {
            status: 200,
            success: 'delete',
            success_description: `Post deleted from ${url}`
          };
        }

        break;
      }

      case 'undelete': {
        const undeleted = await undeletePost(req, postData).catch(error => {
          throw new Error(error.message);
        });

        if (undeleted) {
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
        const updated = await updatePost(req, postData, posts).catch(error => {
          throw new Error(error.message);
        });

        if (updated) {
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
    throw new Error(error.message);
  });

  if (uploaded) {
    for (const upload of uploaded) {
      const property = upload.type;
      body[property] = utils.addToArray(body[property], upload.url);
    }
  }

  // Create post
  const created = await createPost(req, posts).catch(error => {
    throw new Error(error.message);
  });

  if (created) {
    return {
      location: created.url,
      status: 202,
      success: 'create_pending',
      success_description: `Post will be created at ${created.url}`
    };
  }
};
