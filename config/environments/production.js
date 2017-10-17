const nconf = require('nconf');
const path = require('path');

nconf.set('url', process.env.APP_HOSTNAME);

let knex_path = path.resolve(nconf.get('NODE_ENV_PATH'), '/knexfile.js');
nconf.set('knexfile', knex_path);