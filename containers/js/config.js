const Hours = 60 * 60;

const config = {
  SATELLITE_COUCH_URL: '',
  SATELLITE_API_URL: 'http://horti',
  UPSTREAM_API_URL: 'https://upstream',
  FREQUENCY_META: 6 * Hours,
  FREQUENCY_LOCAL_DOCS: 24 * Hours,
  FREQUENCY_USERS: 1 * Hours,
};

const updateConfigFromSource = src => Object.keys(config)
  .filter(key => src[key])
  .forEach((key) => {
    config[key] = src[key];
  });

updateConfigFromSource(process.env);
module.exports = config;
