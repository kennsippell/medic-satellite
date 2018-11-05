const {
  SATELLITE_API_URL,
  FREQUENCY_META,
  FREQUENCY_LOCAL_DOCS,
  FREQUENCY_USERS,
} = require('./config');

const { waitForUrl } = require('./utils');
const replicate = require('./replicate');

process.on('unhandledRejection', console.error);

console.log('Starting continuous replication ...');
console.log(`Config: Meta-${FREQUENCY_META}s Local-${FREQUENCY_LOCAL_DOCS}s`);

(async () => {
  console.log(`Waiting for satellite service at ${SATELLITE_API_URL}`);
  await waitForUrl(5, SATELLITE_API_URL, 'login');
  console.log('CouchDB launch confirmed');

  await replicate.replicate('medic', 'medic', { continuous: true });
  await replicate.replicate('medic', 'medic', { continuous: true, push: true });

  setInterval(replicate.metaDbs, FREQUENCY_META * 1000);
  setInterval(replicate.localDocs, FREQUENCY_LOCAL_DOCS * 1000);
  setInterval(() => replicate.replicate('_users', 'users'), FREQUENCY_USERS * 1000);
})();
