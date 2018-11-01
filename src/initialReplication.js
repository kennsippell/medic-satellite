const {
  sleep,
  fetchJson,
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

  await replicate.clear();

  console.log('Stubbing audit database');
  await put(SATELLITE_COUCH_URL, 'medic-audit');

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
    jobs = await fetchJson(SATELLITE_COUCH_URL, '_scheduler/jobs');

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
