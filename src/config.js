const Hours = 60 * 60;

const {
  SATELLITE_COUCH_URL = 'http://medic:pwd123@couch:5984',
  SATELLITE_API_URL = 'http://horti:5988',
  UPSTREAM_API_URL = 'http://admin:pass@upstream:5988',
  FREQUENCY_META = 6 * Hours,
  FREQUENCY_LOCAL_DOCS = 24 * Hours,
  FREQUENCY_USERS = 1 * Hours,
} = process.env;

module.exports = {
  SATELLITE_COUCH_URL,
  SATELLITE_API_URL,
  UPSTREAM_API_URL,
  FREQUENCY_META,
  FREQUENCY_LOCAL_DOCS,
  FREQUENCY_USERS,
};
