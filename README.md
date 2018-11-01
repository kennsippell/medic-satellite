# Medic Mobile Offline Sync
## For Developers

This workflow turns your local machine into a Medic Satellite.

1. Start services for standard [medic-webapp](https://github.com/medic/medic-webapp) developer workflow.
2. Set `[couch_httpd_auth]/secret` to match the secret of your local CouchDB in `couchdb-local.ini`.
3. Create some local aliases to work from in `/etc/hosts`.
```
127.0.0.1       upstream
127.0.0.1       satellite
127.0.0.1       couch
```
4. Run `docker-compose up` in this directory. Wait a bit for everything to spin up.

You're now ready! 

Url | Simulates
-- | ---
`http://upstream:5988` | Upstream API endpoint
`http://upstream:5984` | Upstream CouchDB
`http://satellite:6988` | Satellite API endpoint
`http://satellite:6984` | Satellite CouchDB
