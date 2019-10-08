const fsp = require('fs').promises;
const camelcaseKeys = require('camelcase-keys');
const microformats = require('@indiekit/microformats');
const {utils} = require('@indiekit/support');
const dataFormat = require('./utils/data-format');
const derive = require('./utils/derive');

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

    // Post type
    const type = derive.postType(mf2);
    const typeConfig = pub['post-type-config'][type];
    const typeTemplateFile = await fsp.readFile(typeConfig.template);
    const typeTemplate = Buffer.from(typeTemplateFile).toString('utf-8');

    // Derive properties
    const {properties} = mf2;
    properties.content = derive.content(mf2);
    properties.photo = await derive.photo(mf2);
    properties.published = derive.published(mf2);
    properties.slug = derive.slug(mf2, pub['slug-separator']);

    // Render publish path and public url
    let path = utils.render(typeConfig.post.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.post.url, properties);
    url = derive.permalink(pub.url, url);

    // Render content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));

    // Create post file
    const {publisher} = pub;
    const message = `${typeConfig.icon} Created ${type} post`;
    const response = await publisher.createFile(path, content, message);

    // Return post data
    if (response) {
      const postData = dataFormat.post(type, path, url, properties);
      posts = utils.addToArray(posts, postData);
      return postData;
    }
  } catch (error) {
    throw new Error(error);
  }
};
