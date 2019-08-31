const {DateTime} = require('luxon');

/**
 * Derives published date (based on microformats2 data, else the current date).
 *
 * @exports derivePublished
 * @param {Object} mf2 microformats2 object
 * @param {Object} locale Locale to use for formatting datetime
 * @returns {Array} Array containing ISO formatted date
 */
module.exports = (mf2, locale = 'en-GB') => {
  let {published} = mf2.properties;
  const now = DateTime.local().toISO();

  if (published) {
    published = DateTime.fromISO(published[0], {
      locale
    }).toISO();
    return new Array(published);
  }

  return new Array(now);
};
