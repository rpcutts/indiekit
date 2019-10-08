const fs = require('fs');
const camelcaseKeys = require('camelcase-keys');
const {utils} = require('@indiekit/support');
const dataFormat = require('./utils/data-format');
const derive = require('./utils/derive');
const update = require('./utils/update');

/**
 * Updates a post.
 *
 * @exports update
 * @param {Object} req Request
 * @param {Object} postData Stored post data object
 * @param {Object} posts Post data store
 * @returns {String} Location of undeleted post
*/
module.exports = async (req, postData, posts) => {
  try {
    const {body} = req;

    // Publication
    const {pub} = req.app.locals;

    // Post type
    const {type} = postData;
    const typeConfig = pub['post-type-config'][type];
    const typeTemplateFile = fs.readFileSync(typeConfig.template);
    const typeTemplate = Buffer.from(typeTemplateFile).toString('utf-8');

    // Get properties
    let {properties} = postData.mf2;

    // Replace property entries
    if (Object.prototype.hasOwnProperty.call(body, 'replace')) {
      properties = update.replaceEntries(properties, body.replace);
    }

    // Add properties
    if (Object.prototype.hasOwnProperty.call(body, 'add')) {
      properties = update.addProperties(properties, body.add);
    }

    // Remove properties and/or property entries
    if (Object.prototype.hasOwnProperty.call(body, 'delete')) {
      if (Array.isArray(body.delete)) {
        properties = update.deleteProperties(properties, body.delete);
      } else {
        properties = update.deleteEntries(properties, body.delete);
      }
    }

    // Update publish path and public url
    let path = utils.render(typeConfig.post.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.post.url, properties);
    url = derive.permalink(pub.url, url);

    // Update content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));

    // Update (or create new) post file
    const {publisher} = pub;
    const message = `${typeConfig.icon} Updated ${type} post`;
    const response = await publisher.updateFile(path, content, message);

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
