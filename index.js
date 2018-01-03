// /index.js
const server = require('./config/initializers/server');
const nconf = require('nconf');
const async = require('async');
const logger = require('winston');

// Set process title (Linux only)
process.title = 'rtf';
console.log(`Process title: ${process.title}`);

// Load Environment variables from .env file
require('dotenv').load();

// Set up configs
nconf.use('memory');
// First load command line arguments
nconf.argv();
// Load environment variables
nconf.env();
// Load config file for the environment
require(`./config/environments/${nconf.get('NODE_ENV') || 'development'}`);

logger.info('[APP] Starting server initialization');

// Initialize Modules
async.series([
  // function initializeDBConnection(callback) {
  //   require('./config/initializers/database')(callback);
  // },
  function startServer(callback) {
    server(callback);
  }], (err) => {
  if (err) {
    logger.error('[APP] initialization failed', err);
  } else {
    logger.info('[APP] initialized SUCCESSFULLY');
  }
});
