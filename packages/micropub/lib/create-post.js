const camelcaseKeys = require('camelcase-keys');
const derivePostType = require('post-type-discovery');
const microformats = require('@indiekit/microformats');
const {utils} = require('@indiekit/support');
const publication = require('@indiekit/publication');
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
    const {pub} = req.app.locals;
    const {publisher} = pub;
    const {body} = req;
    const mf2 = req.is('json') ? body : microformats.formEncodedToMf2(body);

    // Derive type
    const type = derivePostType(mf2);

    // Get type config
    const typeConfig = pub['post-types'][type];

    // Derive properties
    const {properties} = mf2;
    properties.content = microformats.deriveContent(mf2);
    properties.photo = await microformats.derivePhoto(mf2);
    properties.published = microformats.derivePublished(mf2);
    properties.slug = microformats.deriveSlug(mf2, pub['slug-separator']);

    // Get template
    const template = await publication.getPostTypeTemplate(typeConfig);

    // Render publish path and public url
    let path = utils.render(typeConfig.post.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.post.url, properties);
    url = utils.derivePermalink(pub.url, url);

    // Render content
    const content = utils.render(template, camelcaseKeys(properties));

    // Compose commit message
    const message = `${typeConfig.icon} Created ${type} post`;

    // Create post file
    const response = await publisher.createFile(path, content, message);
    if (response) {
      const postData = createData(type, path, url, properties);
      posts = utils.addToArray(posts, postData);
      return postData;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
