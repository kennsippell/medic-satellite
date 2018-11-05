#!/bin/bash

echo Generate a root key.
openssl genrsa -out ./config/root-ca.key 4096

echo Generate a CSR using the root key.
openssl req \
        -new -key ./config/root-ca.key \
        -out ./config/root-ca.csr -sha256 \
        -subj '/C=KE/L=Nairobi/O=Medic Mobile/CN=Medic CA'

echo Sign a CA certificate
openssl x509 -req  -days 365 -in ./config/root-ca.csr \
              -signkey ./config/root-ca.key -sha256 -out ./config/root-ca.crt \
              -extfile ./config/root-ca.cnf -extensions \
              root_ca
