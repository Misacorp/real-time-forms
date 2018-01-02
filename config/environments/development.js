const nconf = require('nconf');
const path = require('path');

nconf.set('url', 'realtimeforms.local');

const knexPath = path.resolve(`${process.cwd()}/knexfile.js`);
nconf.set('knexfile', knexPath);
