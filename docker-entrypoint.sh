#!/bin/sh
set -e

node scripts/seed.js
node server.js
