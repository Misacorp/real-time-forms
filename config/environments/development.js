const nconf = require('nconf');
const path = require('path');

nconf.set('url', 'realtimeforms.local');

let knex_path = path.resolve(nconf.get('NODE_ENV_PATH'), 'OLD/knexfile.js');
nconf.set('knexfile', knex_path);