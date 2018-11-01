const fetch = require('node-fetch');

const makeUrl = (host, path) => (path ? `${host}/${path}` : host);
const sleep = secs => new Promise(resolve => setTimeout(resolve, secs * 1000));
const fetchJson = async (url, path) => (await fetch(makeUrl(url, path))).json();
const tryFetchJson = (...args) => new Promise(resolve => fetchJson(...args).then(resolve).catch(() => resolve(false)));

/* TODO: Can we log urls without the password */
const waitForUrl = async (pauseFor, host, path) => {
  while (!await tryFetchJson(host, path)) {
    console.log(`Awaiting response from ${host}`);
    await sleep(pauseFor);
  }
};

const del3te = (host, path) => fetch(makeUrl(host, path), { method: 'DELETE' });

const put = (host, path, body) => fetch(makeUrl(host, path), {
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
  fetchJson,
  tryFetchJson,
  waitForUrl,
  del3te,
  put,
};
