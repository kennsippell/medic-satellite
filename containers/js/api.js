const fs = require('fs');
const { fork } = require('child_process');

const {
  replicationStatus,
  sleep,
} = require('./utils');
const { API_PATH, STATUS_FILE_DIRECTORY } = require('./config');

console.log('Medic Satellite Server -- API Container');

(async () => {
  const statusFilePath = replicationStatus(STATUS_FILE_DIRECTORY);
  do {
    console.log(`Awaiting initial replication status at ${statusFilePath}`);
    await sleep(5);
  } while (!fs.existsSync(statusFilePath));

  while (true) {
    try {
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
