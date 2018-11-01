const {
  sleep,
  fetchWithStatus,
  waitForUrl,
  put,
} = require('./utils');

const { SATELLITE_COUCH_URL } = require('./config');
const replicate = require('./replicate');

console.log('Medic Satellite Server -- Initial Replication');
process.on('unhandledRejection', console.error);

(async () => {
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
})();
