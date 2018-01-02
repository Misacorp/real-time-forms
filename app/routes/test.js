// app/routes/test.js

module.exports = function testRoute(router) {
  router.route('/')
    .get((req, res) => {
      res.send({ status: 'Everything seems to be working. Have a great day!' });
    }).post((req, res) => {
      res.send({ status: 'Thanks for the mail. Enjoy your day!' });
    });
};
