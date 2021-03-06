//This file provides the code behind the file editor environments.
//It assumes the existence of a canvas (mycanvas), a div (output) and a textfield (yourcode).
//The canvas is used for graphics, and the div for text.

//This returns an output function which works on the element 'out_pre'.
function outf(out_pre) {
  return function(text) {
    out_pre.innerHTML = out_pre.innerHTML + text;
  }
}
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

//This will run the i-th textarea's code in its respective canvas and pre.
//It takes the index of the textarea (i) as input, and grabs all the associated HTML elements.
//It then configures the output function, and calls Sk.importMainWithBody().
function runit(i) {
   var prog = document.getElementById("code_" + i).value;
   var canvas = document.getElementById("canvas_" + i);
   var out_pre = document.getElementById("output_" + i);
   out_pre.innerHTML = '';
   Sk.canvas = "canvas_" + i;
   Sk.pre = "output_" + i;
   Sk.configure({output:outf(out_pre), read:builtinRead});
   try {
      eval(Sk.importMainWithBody("<stdin>",false,prog));
   }
   catch(e) {
       alert(e.toString())
   }
}

//Saves changes to old programs in /files
function saveit(i, name) {
  if(confirm("Are you sure you want to save changes to " +  name + "?")) {
    var prog = document.getElementById("code_" + i).value; //Retrieve code
    var request = new XMLHttpRequest();  //Request will send the new code to server
    request.open("POST", "/save_old/" + name); //Add name to end to specify file to save
    request.send(prog); //Sends code as plain text
    alert("Done!");
  }
}

//Deletes user's program
function rem_prog(i, name) {
  //Will make all elements related to file hidden if it is deleted
  var editor = document.getElementById("editor_" + i);

  if(confirm("Are you sure you want to remove " + name + "?")) {
    //Send request to remove file
    var request = new XMLHttpRequest();
    request.open("POST", "/remove/" + name);
    request.send(null);

    //Hide all relevant elements
    editor.style.display = 'none';

    alert("Done!");
  }
}

//Make new program
function new_prog() {
  var name = prompt("Enter name of program \n(.py at end, alphanumeric chars or '_'):");
  if(name) { //If user did not press 'cancel'
    var request = new XMLHttpRequest();
    request.open("POST", "/new_prog/" + name);
    request.send(null);

    alert("Program " + name + " successfully created!");

    window.location.reload(true); //Reload page (render new file in browser)
  }
}
