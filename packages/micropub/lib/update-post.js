const camelcaseKeys = require('camelcase-keys');
const publication = require('@indiekit/publication');
const {utils} = require('@indiekit/support');
const createData = require('./create-data');

/**
 * Updates a post.
 *
 * @exports update
 * @param {Object} req Request
 * @param {Object} postData Stored post data object
 * @returns {String} Location of undeleted post
*/
module.exports = async (req, postData) => {
  try {
    const {pub} = req.app.locals;
    const {publisher} = pub;
    const {body} = req;

    // Get type
    const {type} = postData;

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

    // Get type config
    const typeConfig = pub['post-types'][type];

    // Get template
    const template = await publication.getPostTypeTemplate(typeConfig);

    // Update publish path and public url
    let path = utils.render(typeConfig.post.path, properties);
    path = utils.normalizePath(path);
    let url = utils.render(typeConfig.post.url, properties);
    url = utils.derivePermalink(pub.url, url);

    // Update content
    const content = utils.render(template, camelcaseKeys(properties));

    // Compose commit message
    const message = `${typeConfig.icon} Updated ${type} post`;

    // Update (or create new) post file
    const response = await publisher.updateFile(path, content, message);
    if (response) {
      const postData = createData(type, path, url, properties);
      utils.addToArray(req.session.posts, {[url]: postData});
      return postData;
    }
  } catch (error) {
    throw new Error(error);
  }
};
