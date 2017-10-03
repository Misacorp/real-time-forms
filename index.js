"use strict";

const express = require('express');
const store = require('./store');
const bodyParser = require('body-parser');
// const formidable = require('express-formidable');
const app = express();
const port = 1337;

//  Define public directory
app.use(express.static('public'));
app.use(bodyParser.json());

//  Configure formidable
// app.use(formidable({
//   encoding: 'utf-8',
//   uploadDir: '/var/www/realtimeforms/htdocs/uploads/',
//   multiples: true,
// }));


/*  POST /input
 *  Accepts form data consisting of multiple fields.
 */
app.post('/response', (req, res) => {
  console.log("Responding to /response request");

  //  Get each question_id - response pair.
  store
    .addResponse(req.body.response)
    .then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send({success : 'lol'});
    });
});


//  Create a manager
app.post('/managers', (req, res) => {
  //  Parse form data
  let manager_name = req.body.name;

  store
    .createManager({
      name: manager_name
    })
    .then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send({manager_id : manager_name});
    });
});





//  Update a manager
app.patch('/managers', (req, res) => {
  res.sendStatus(200);
});

app.get('/lol', (req, res) => {
  console.log("Responding to /lol request");
  res.sendStatus(200);
});


app.listen(port, () => {
  console.log('Server running on port ' + port);
});