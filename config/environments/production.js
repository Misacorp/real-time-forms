const nconf = require('nconf');
const path = require('path');

nconf.set('url', process.env.APP_HOSTNAME);

const knexPath = path.resolve(`${process.cwd()}/knexfile.js`);
nconf.set('knexfile', knexPath);
