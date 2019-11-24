const microformats = require('@indiekit/microformats');
const utils = require('@indiekit/support');
const deriveProperty = require('./../utils/derive-property');

/**
 * Create post data object.
 *
 * @exports createData
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
    const type = deriveProperty.postType(mf2);
    const typeConfig = pub['post-type-config'][type];

    // Derive properties
    const {properties} = mf2;
    properties.content = deriveProperty.content(mf2);
    properties.photo = await deriveProperty.photo(mf2);
    properties.published = deriveProperty.published(mf2, pub.locale, pub.timezone);
    properties.slug = deriveProperty.slug(mf2, pub['slug-separator']);

    // Render publish path and public url
    const path = utils.render(typeConfig.post.path, properties);
    let url = utils.render(typeConfig.post.url, properties);
    url = deriveProperty.permalink(pub.me, url);

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
    throw new Error(error.message);
  }
};
