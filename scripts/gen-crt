#!/bin/bash

CONFIG_NAME="${1:-dev}"

echo "Generate the satellite key $CONFIG_NAME"
openssl genrsa -out "./config/$CONFIG_NAME/satellite.key" 4096

echo Generate the satellite certificate and sign it with the satellite key.
openssl req -new -key "./config/$CONFIG_NAME/satellite.key" -out "./config/$CONFIG_NAME/satellite.csr" -sha256 \
        -subj "/C=KE/L=Nairobi/O=Medic Mobile/CN=$CONFIG_NAME.satellite.local"

echo Sign the satellite certificate.
openssl x509 -req -days 750 -in "./config/$CONFIG_NAME/satellite.csr" -sha256 \
    -CA ./config/root-ca.crt -CAkey ./config/root-ca.key  -CAcreateserial \
    -out "./config/$CONFIG_NAME/satellite.crt" -extfile ./config/site.cnf -extensions server
