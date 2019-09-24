const camelcaseKeys = require('camelcase-keys');
const derivePostType = require('post-type-discovery');
const microformats = require('@indiekit/microformats');
const {utils} = require('@indiekit/support');
const createData = require('./create-data');

/**
 * Creates a post file.
 *
 * @exports createPost
 * @param {Object} req Request
 * @param {Object} posts Post data store
 * @returns {String} Location of created file
 */
module.exports = async (req, posts) => {
  try {
    const {body} = req;
    const mf2 = req.is('json') ? body : microformats.formEncodedToMf2(body);

    // Publication
    const {pub} = req.app.locals;
    const pubConfig = pub ? await pub.getConfig() : false;

    if (!pubConfig) {
      throw new Error('Publication config not found');
    }

    // Post type
    const type = derivePostType(mf2);
    const typeConfig = pubConfig['post-types'][type];
    const typeTemplate = await pub.getPostTypeTemplate(typeConfig);

    // Derive properties
    const {properties} = mf2;
    properties.content = microformats.deriveContent(mf2);
    properties.photo = await microformats.derivePhoto(mf2);
    properties.published = microformats.derivePublished(mf2);
    properties.slug = microformats.deriveSlug(mf2, pubConfig['slug-separator']);

    // Render publish path and public url
    let path = utils.render(typeConfig.post.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.post.url, properties);
    url = utils.derivePermalink(pubConfig.url, url);

    // Render content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));

    // Create post file
    const {publisher} = pubConfig;
    const message = `${typeConfig.icon} Created ${type} post`;
    const response = await publisher.createFile(path, content, message);

    // Return post data
    if (response) {
      const postData = createData(type, path, url, properties);
      posts = utils.addToArray(posts, postData);
      return postData;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
