const microformats = require('@indiekit/microformats');
const utils = require('@indiekit/support');
const derive = require('./utils/derive');

/**
 * Creates a post data object.
 *
 * @exports createPostData
 * @param {Object} req Request
 * @param {Object} pub Publication settings
 * @returns {Object} postData
 */
module.exports = async (req, pub) => {
  try {
    // Get post body
    const {body} = req;
    const mf2 = req.is('json') ? body : microformats.formEncodedToMf2(body);

    // Post type
    const type = derive.postType(mf2);
    const typeConfig = pub['post-type-config'][type];

    // Derive properties
    const {properties} = mf2;
    properties.content = derive.content(mf2);
    properties.photo = await derive.photo(mf2);
    properties.published = derive.published(mf2);
    properties.slug = derive.slug(mf2, pub['slug-separator']);

    // Render publish path and public url
    const path = utils.render(typeConfig.post.path, properties);
    let url = utils.render(typeConfig.post.url, properties);
    url = derive.permalink(pub.me, url);

    // Return post data
    const postData = {
      type,
      path,
      url,
      mf2: {
        type: (type === 'event') ? ['h-event'] : ['h-entry'],
        properties
      }
    };
    return postData;
  } catch (error) {
    throw new Error(error);
  }
};
