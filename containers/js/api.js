const fs = require('fs');

const {
  replicationStatus,
  sleep,
} = require('./utils');
const { API_PATH, STATUS_FILE_DIRECTORY } = require('./config');

console.log('Medic Satellite Server -- API Container');
const startApi = () => new Promise(() => {
  const apiPath = `${API_PATH}/server.js`;
  require(apiPath); // eslint-disable-line
});

(async () => {
  const statusFilePath = replicationStatus(STATUS_FILE_DIRECTORY);
  while (!fs.existsSync(statusFilePath)) {
    console.log(`Awaiting initial replication status at ${statusFilePath}`);
    await sleep(5);
  }

  while (true) {
    try {
      await startApi();
    } catch (error) {
      console.error(error);
    }

    await sleep(20);
  }
})();
