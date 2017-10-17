// config/initializers/server.js

const express = require('express')
const cors = require('cors');
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

  // Enable CORS for all origins
  app.use(cors());

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

  const port = process.env.PORT || 1337;
  app.listen(config.get(port));
  logger.info('[SERVER] Listening on port ' + port);
  
  if (cb) {
    return cb();
  }
};

module.exports = start;