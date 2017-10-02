const FormData = document.querySelector('.formData');

//  When submit is clicked
FormData.addEventListener('submit', (e) => {
  e.preventDefault();
  const color = FormData.querySelector('.favourite_color').value
  post('/input', { color })
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