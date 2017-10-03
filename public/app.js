const FormData = document.querySelector('.formData');

//  When submit is clicked
FormData.addEventListener('submit', (e) => {
  e.preventDefault();
  
  //  Find input elements
  let inputs = document.getElementsByClassName('real-time-input');

  //  Initialize response object
  const response = {};

  //  Fill array with input values
  for(let i = 0; i < inputs.length; i++) {
    //  Get name and value
    let name = inputs[i].getAttribute('name');
    let value = inputs[i].value;

    //  Add name-value pair object to responses
    response[name] = value;
  }

  //  Send responses
  post('/response', { response })
});

function post(path, data) {
  console.log("Posting the following data to " + path);
  console.log(data);

  return window.fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}