const fs = require('fs');

const {
  sleep,
  fetchWithStatus,
  waitForUrl,
  put,
  replicationStatus,
} = require('./utils');

const {
  SATELLITE_COUCH_URL,
  UPSTREAM_API_URL,
  STATUS_FILE_DIRECTORY,
} = require('./config');
const replicate = require('./replicate');

console.log('Medic Satellite Server -- Initial Replication Container');
process.on('unhandledRejection', console.error);
const statusFilePath = replicationStatus(STATUS_FILE_DIRECTORY);

const waitForReplications = async () => {
  let jobs;
  do {
    await sleep(5);
    jobs = await fetchWithStatus([200], SATELLITE_COUCH_URL, '_scheduler/jobs');

    const typeCount = jobs.jobs.reduce((agg, job) => {
      const jobType = job.history[0].type;
      agg[jobType] = (agg[jobType] || 0) + 1; // eslint-disable-line no-param-reassign
      return agg;
    }, {});

    const types = Object.keys(typeCount);
    const typeStatus = types.length > 0 ? `Status: ${types.join('-')} ${types.map(type => typeCount[type]).join('-')}` : 'Done!';
    console.log(`Awaiting replications to complete. ${typeStatus || ''}`);
  } while (jobs.total_rows > 0);
};

(async () => {
  console.log(`Clearing status file at ${statusFilePath}`);
  if (fs.existsSync(statusFilePath)) fs.unlink(statusFilePath);

  console.log(`Waiting for connectivity to upstream service at ${UPSTREAM_API_URL}`);
  await waitForUrl(5, `${UPSTREAM_API_URL}/medic/settings`);
  console.log(`Waiting for CouchDB service at ${SATELLITE_COUCH_URL}`);
  await waitForUrl(5, SATELLITE_COUCH_URL);
  console.log('CouchDB launch confirmed');

  console.log('Stubbing databases');
  const stub = db => put(SATELLITE_COUCH_URL, db, undefined, [201, 412]);
  await stub('_replicator');
  await stub('_users');
  await stub('medic');
  await stub('medic-audit');

  await replicate.clear();

  console.log('Starting initial replication ...');
  await replicate.replicate('medic', 'medic');
  await replicate.replicate('_users', 'users');
  await replicate.metaDbs();
  await replicate.localDocs();

  await waitForReplications();

  // TODO: View Warming

  console.log(`Writing completion status to ${statusFilePath}`);
  fs.writeFileSync(statusFilePath, new Date().getTime());

  process.exit(666);
})();
