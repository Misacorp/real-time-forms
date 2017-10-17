// app/routes/test.js
"use strict"
const nconf = require('nconf');
const store = require('../actions/store');
const knexfile = require('../../knexfile');
const knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);

const Promise = require("bluebird");

module.exports = function(router) {
  'use strict';

  router.route('/')
  .get(function(req, res, next) {
    res.send({ status: "Everything seems to be working. Have a great day!" });
  }).post(function(req, res, next) {
    res.send({ status: "Thanks for the mail. Enjoy your day!"})
  });
};