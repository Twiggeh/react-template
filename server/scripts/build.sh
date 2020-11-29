#!usr/bin/bash
# Set all environ variables, then run node (with tmux, otherwise use something like pm2 to deamonize)
echo NODE_ENV=production > .env
echo DOMAIN=dontforgettochangeme >> .env
echo SUBDOMAIN=www >> .env
echo DOMAINEXTENSION=com >> .env
node app