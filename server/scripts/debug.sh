#!/usr/bin/bash
# Set all environ variables, then run nodemon
echo NODE_ENV=development > .env
tsc -w