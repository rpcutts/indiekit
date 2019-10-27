/**
 * Creates a commit message.
 *
 * @exports formatCommitMessage
 * @param {Object} action Commit action
 * @param {Object} postData postData
 * @param {Object} pub Publication settings
 * @returns {String} Commit message
 */
module.exports = async (action, postData, pub) => {
  try {
    const {type} = postData;
    const {icon} = pub['post-type-config'][type];

    switch (action) {
      case 'create': {
        return `${icon} Created ${type} post`;
      }

      case 'delete': {
        return `:x: Deleted ${type} post`;
      }

      case 'undelete': {
        return `${icon} Undeleted ${type} post`;
      }

      case 'update': {
        return `${icon} Updated ${type} post`;
      }

      case 'upload': {
        return `:framed_picture: Uploaded ${type}`;
      }

      default:
    }
  } catch (error) {
    throw new Error(error);
  }
};
