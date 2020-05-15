const {DateTime} = require('luxon');

const config = require(process.env.PWD + '/app/config');

/**
 * Derives published date (based on microformats2 data, else the current date).
 *
 * @exports dervivePublished
 * @param {Object} mf2 microformats2 object
 * @returns {Array} Array containing ISO formatted date
 */
module.exports = mf2 => {
  let {published} = mf2.properties;
  const now = DateTime.local().toISO();

  if (published) {
    if(published[0].length > 19){
      // dirty hack: lob off anything after the time cos some apps don't send the rest of it correctly 
      //and I don't care about this data
      published = published[0].substring(0,18); 
    }
    
    published = DateTime.fromISO(published, {
      locale: config.locale,
      zone: 'utc'
    }).toISO();
    return new Array(published);
  }

  return new Array(now);
};
