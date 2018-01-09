const store = require('../../app/actions/store');

store.getUserByKey('keythatdoesntexist')
  .then(data => console.log(data));
