const fs = require('fs');
const camelcaseKeys = require('camelcase-keys');
const {utils} = require('@indiekit/support');
const createData = require('./create-data');

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
      properties = utils.replaceEntries(properties, body.replace);
    }

    // Add properties
    if (Object.prototype.hasOwnProperty.call(body, 'add')) {
      properties = utils.addProperties(properties, body.add);
    }

    // Remove properties and/or property entries
    if (Object.prototype.hasOwnProperty.call(body, 'delete')) {
      if (Array.isArray(body.delete)) {
        properties = utils.deleteProperties(properties, body.delete);
      } else {
        properties = utils.deleteEntries(properties, body.delete);
      }
    }

    // Update publish path and public url
    let path = utils.render(typeConfig.post.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.post.url, properties);
    url = utils.derivePermalink(pub.url, url);

    // Update content
    const content = utils.render(typeTemplate, camelcaseKeys(properties));

    // Update (or create new) post file
    const {publisher} = pub;
    const message = `${typeConfig.icon} Updated ${type} post`;
    const response = await publisher.updateFile(path, content, message);

    // Return post data
    if (response) {
      const postData = createData(type, path, url, properties);
      posts = utils.addToArray(posts, postData);
      return postData;
    }
  } catch (error) {
    throw new Error(error);
  }
};