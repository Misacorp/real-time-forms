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


//  Post form data
app.post('/response', (req,res) => {
  //  Get each question_id - response pair.
  store
    .addResponse(req.body.response)
    .then((data) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send({success : data});
    });
});


//  Create a question
app.post('/question', (req,res) => {
  //  Sanitize input data somehow?
  let content = req.body.question_content;

  //  Store in database
  store
    .addQuestion(content)
    .then((question_id) => {
      console.log(`Added question: "${content}" with id: ${question_id}`)

      res.setHeader('Content-Type', 'application/json');
      res.status(201);
      res.send({question_id : question_id});
    });
});


//  Get unique responses to a question
app.get('/response', (req, res) => {
  console.log("GET /response " + req.query.question);
  let question_id = req.query.question;

  //  Remove all non-numeric characters
  question_id = question_id.replace(/\D/g,'');

  store
    .getAnswers(question_id)
    .then((data) => {
      // 'data' is in JSON format: {content : value}.
      // Format data into a simple array.
      let arr = [];
      for(let i=0; i < data.length; i++) {
        arr.push(data[i]['content']);
      }

      res.setHeader('Content-Type', 'application/json');
      res.status(200);
      res.send(arr);
    })
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