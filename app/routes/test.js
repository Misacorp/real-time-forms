// app/routes/test.js
"use strict"
const nconf = require('nconf');
const store = require('../actions/store');
const knex = require('knex')(require(nconf.get('knexfile')));

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