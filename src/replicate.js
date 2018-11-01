const uuid = require('uuid/v4');
const { SATELLITE_COUCH_URL, UPSTREAM_API_URL } = require('./config');

const {
  makeUrl,
  fetchJson,
  put,
  del3te,
} = require('./utils');

const replicate = (db, tag = '', options) => {
  console.log(`Replicating "${db}"`);
  const id = `${tag}-${uuid()}`;
  const payload = Object.assign({
    _id: id,
    source: makeUrl(UPSTREAM_API_URL, db),
    target: makeUrl(SATELLITE_COUCH_URL, db),
    create_target: true,
    continuous: false,
  }, options);

  if (options && options.push) {
    const { target } = payload;
    payload.target = payload.source;
    payload.source = target;
  }

  return put(SATELLITE_COUCH_URL, `_replicator/${id}`, payload);
};

const clear = async () => {
  console.log('Clearing existing replications');
  const existing = await fetchJson(SATELLITE_COUCH_URL, '_replicator/_all_docs');
  const deletes = existing.rows
    .filter(row => !row.id.startsWith('_design'))
    .map(row => del3te(SATELLITE_COUCH_URL, `/_replicator/${row.id}?rev=${row.value.rev}`));
  return Promise.all(deletes);
};

const localDocs = async () => {
  console.log('Syncing local document');
  const securityDoc = await fetchJson(UPSTREAM_API_URL, 'medic/_security');
  return put(SATELLITE_COUCH_URL, 'medic/_security', securityDoc);
};

const metaDbs = async (options) => {
  console.log('Syncing meta databases');
  /* TODO: This is going to start a billion relications at once on real data (one per offline user) */
  const allDbs = await fetchJson(UPSTREAM_API_URL, '_all_dbs');
  const metaReplications = allDbs
    .filter(db => db.startsWith('medic-user-'))
    .map(db => replicate(db, 'meta', options));
  return Promise.all(metaReplications);
};

module.exports = {
  replicate,
  localDocs,
  metaDbs,
  clear,
};
