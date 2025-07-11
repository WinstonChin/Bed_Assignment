const name = document.getElementById('name')
const email = document.getElementById('email')
const bday = document.getElementById('birth-date')

let profile = []

function displayInfo(){

}
//profile picture//
  function preview_image(event) {
    const reader = new FileReader(); //create a reader
    reader.onload = function(){ // set a handler what to do when done loading
      const output = document.getElementById('output_image'); // get the node
      output.src = reader.result; // set the result of the reader as the src of the node
    }
    reader.readAsDataURL(event.target.files[0]); // now start the reader
  }