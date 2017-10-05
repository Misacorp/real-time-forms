// config/initializers/server.js

const express = require('express');
const path = require('path');
// Local dependecies
const config = require('nconf');

// create the express app
// configure middlewares
const bodyParser = require('body-parser');
const logger = require('winston');
var app;

const start =  function(cb) {
  'use strict';
  // Configure express 
  app = express();

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json({type: '*/*'}));

  // Register routes
  logger.info('[SERVER] Initializing routes');
  require('../../app/routes/index')(app);

  // Error handler
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: (app.get('env') === 'development' ? err : {})
    });
    next(err);
  });

  app.listen(config.get('NODE_PORT'));
  logger.info('[SERVER] Listening on port ' + config.get('NODE_PORT'));
  
  if (cb) {
    return cb();
  }
};

module.exports = start;