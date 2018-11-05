const Hours = 60 * 60;

const {
  SATELLITE_COUCH_URL,
  SATELLITE_API_URL,
  UPSTREAM_API_URL,
  FREQUENCY_META = 6 * Hours,
  FREQUENCY_LOCAL_DOCS = 24 * Hours,
  FREQUENCY_USERS = 1 * Hours,
} = process.env;

const config = {
  SATELLITE_COUCH_URL,
  SATELLITE_API_URL,
  UPSTREAM_API_URL,
  FREQUENCY_META,
  FREQUENCY_LOCAL_DOCS,
  FREQUENCY_USERS,
};

const unassigned = Object.keys(config).map(key => config[key]).filter(val => !val);
if (unassigned.length > 0) {
  console.log(`${unassigned.join(',')} environment variables must be defined`);
  process.exit(-1);
}

module.exports = config;
