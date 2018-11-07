const fetch = require('node-fetch');
const pathLib = require('path');

const makeUrl = (host, path) => (path ? `${host}/${path}` : host);
const sleep = secs => new Promise(resolve => setTimeout(resolve, secs * 1000));
const fetchJson = async (url, path, options) => (await fetch(makeUrl(url, path), options)).json();
const tryFetchJson = (...args) => new Promise(resolve => fetchJson(...args).then(resolve).catch(() => resolve(false)));

/* TODO: Can we log urls without the password */
const waitForUrl = async (pauseFor, host, path) => {
  while (!await tryFetchJson(host, path)) {
    console.log(`Awaiting response from ${host}`);
    await sleep(pauseFor);
  }
};

const del3te = (host, path) => fetch(makeUrl(host, path), { method: 'DELETE' });

const fetchWithStatus = (status, url, path, options) => new Promise((resolve, reject) => fetch(makeUrl(url, path), options)
  .then((response) => {
    if (response.error) {
      const error = JSON.stringify(Object.assign({}, response, { url, path, options }));
      reject(new Error(error));
      return;
    }

    if (status.includes(response.status)) {
      resolve(response.json());
    } else {
      reject(new Error(`Fetch status was ${response.status} but expecting ${status} for ${response.url}`));
    }
  }));

const put = (host, path, body, status = [200, 201]) => fetchWithStatus(status, host, path, {
  method: 'PUT',
  body: JSON.stringify(body),
  redirect: 'manual',
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = {
  makeUrl,
  sleep,
  fetch: fetchJson,
  fetchWithStatus,
  tryFetchJson,
  waitForUrl,
  del3te,
  put,
  replicationStatus: dir => pathLib.normalize(pathLib.join(dir, 'initialReplication.status')),
};
