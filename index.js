const express = require('express');
const bodyParser = require('body-parser');
// const store = require('./store');
const formidable = require('express-formidable');
const app = express();

const port = 1337;

//  Define public directory
app.use(express.static('public'));
app.use(bodyParser.json());
// app.use(formidable({
//   encoding: 'utf-8',
//   uploadDir: '/var/www/realtimeforms/htdocs/uploads/',
//   multiples: true
// }));

/*  POST /input
 *  Accepts form data consisting of multiple fields.
 */
app.post('/input', (req, res) => {
  console.log("Responding to /input request asd");
  res.sendStatus(200);
});

app.get('/lol', (req, res) => {
  console.log("Responding to /lol request lol");
  res.sendStatus(200);
});


app.listen(port, () => {
  console.log('Server running on port ' + port);
});