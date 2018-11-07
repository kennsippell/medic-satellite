const fs = require('fs');

const {
  sleep,
  fetchWithStatus,
  waitForUrl,
  put,
  replicationStatus,
} = require('./utils');

const { SATELLITE_COUCH_URL, UPSTREAM_API_URL, STATUS_FILE_DIRECTORY } = require('./config');
const replicate = require('./replicate');

console.log('Medic Satellite Server -- Initial Replication');
process.on('unhandledRejection', console.error);

(async () => {
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

  const HopelessCrashCount = 10;
  let hopelessCount;
  let jobs;
  do {
    await sleep(5);
    jobs = await fetchWithStatus([200], SATELLITE_COUCH_URL, '_scheduler/jobs');

    const typeCount = jobs.jobs.reduce((agg, job) => {
      const jobType = job.history[0].type;
      agg[jobType] = (agg[jobType] || 0) + 1; // eslint-disable-line no-param-reassign
      return agg;
    }, {});

    hopelessCount = jobs.jobs.filter(job => job.history.filter(history => history.type === 'crashed').length > HopelessCrashCount).length;
    const hopelessStatus = hopelessCount > 0 && `(${hopelessCount} crashed >${HopelessCrashCount} times).`;

    const types = Object.keys(typeCount);
    const typeStatus = types.length > 0 ? `Status: ${types.join('-')} ${types.map(type => typeCount[type]).join('-')}` : 'Done!';
    console.log(`Awaiting replications. ${typeStatus || ''} ${hopelessStatus || ''}`);
  } while (hopelessCount < jobs.total_rows);

  // TODO: View Warming
})();

const statusFilePath = replicationStatus(STATUS_FILE_DIRECTORY);
console.log(`Writing replication status to ${statusFilePath}`);
fs.writeFileSync(statusFilePath, new Date().getTime());

// We just rocked out.
process.exit(666);
