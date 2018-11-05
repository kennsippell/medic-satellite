# Medic Mobile Offline Sync

## Development Environment Setup

```shell
# Install node_modules for JavaScript
$(cd containers/js && npm i)

# Generate a local signing authority certificate
./scripts/gen-ca.sh

# Generate a certificates for dev mode
./scripts/gen-crt.sh dev
```

### (Optional) Trust the new certificate authority
To avoid security warnings with the certificates:


**For Chrome:** Settings > Manage Certificates > Authorities > Import > Select medic-satellite/config/root-ca.crt

**For local commands:** `./scripts/trust-ca.sh`

## Running

### Developer Mode
This workflow uses your standard `medic-webapp` services as an upstream service and hosts the Medic Satellite docker container locally.

1. Build `medic-webapp` from source using `grunt build deploy`, not standard dev build.
1. Start services for standard [medic-webapp](https://github.com/medic/medic-webapp) developer workflow.
2. Set `[couch_httpd_auth]/secret` to match the secret of your local CouchDB in `couchdb-local.ini`.
3. Create some local aliases to work from in `/etc/hosts`.
```
127.0.0.1       upstream
127.0.0.1       dev.satellite.local
127.0.0.1       satellite
127.0.0.1       couch
```
4. Run `docker-compose up` in this directory. Wait a bit for everything to spin up.

You're now ready! 

Url | Simulates
-- | ---
`http://upstream:5988` | Upstream API endpoint
`http://upstream:5984` | Upstream CouchDB
`https://dev.satellite.local` | Satellite API endpoint
`http://satellite:6984` | Satellite CouchDB
