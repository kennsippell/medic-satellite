const fs = require('fs');
const { fork } = require('child_process');

const {
  replicationStatus,
  sleep,
  deleteFolder,
  downloadArchiveToFolder,
} = require('./utils');
const {
  API_PATH,
  STATUS_FILE_DIRECTORY,
  SKIP_API_EXTRACTION,
  SATELLITE_COUCH_URL,
} = require('./config');

console.log('Medic Satellite Server -- API Container');

const extractApiFromCouch = async () => {
  if (SKIP_API_EXTRACTION !== '1') {
    if (fs.existsSync(API_PATH)) {
      deleteFolder(API_PATH);
    }
    fs.mkdirSync(API_PATH);
    await downloadArchiveToFolder(SATELLITE_COUCH_URL, 'medic/_design/medic/medic-api-0.1.0.tgz', API_PATH);
  } else {
    console.log('Skipping API extraction as folder already exists.');
  }
};

(async () => {
  const statusFilePath = replicationStatus(STATUS_FILE_DIRECTORY);
  do {
    console.log(`Awaiting initial replication status at ${statusFilePath}`);
    await sleep(5);
  } while (!fs.existsSync(statusFilePath));

  while (true) {
    try {
      console.log('Extracting API code from Couch');
      await extractApiFromCouch();

      const server = fork(`${API_PATH}/server.js`, ['--allow-cors'], {
        stdio: 'pipe',
      });

      server.stdout.on('data', (data) => {
        console.log(`API: ${data}`);
      });

      server.stderr.on('data', (data) => {
        console.error(`API: ${data}`);
      });

      await new Promise((resolve) => {
        server.on('close', (code) => {
          console.log(`Api process exited with code ${code}`);
          resolve();
        });
      });
    } catch (error) {
      console.error(error);
    }

    await sleep(20);
  }
})();
