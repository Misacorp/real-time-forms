const nconf = require('nconf');
const path = require('path');

nconf.set('url', process.env.APP_HOSTNAME);

let dir = nconf.get('NODE_ENV_PATH' ) ? nconf.get('NODE_ENV_PATH') : process.cwd();
let knex_path = path.resolve( dir  + '/knexfile.js' );
nconf.set('knexfile', knex_path);