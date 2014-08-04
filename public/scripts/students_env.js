//This file provides the actual custom code needed to run an environment.
//It assumes the existence of a canvas (mycanvas), a div (output) and a textfield (yourcode).
//The canvas is used for graphics, and the div for text.

// output functions are configurable.  This one just appends some text
// to a pre element.
function outf(text) {
    var mypre = document.getElementById("output");
    mypre.innerHTML = mypre.innerHTML + text;
}
function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
}

// Here's everything you need to run a python program in skulpt
// grab the code from your textarea
// get a reference to your pre element for output
// configure the output function
// call Sk.importMainWithBody()
function runit() {
   var prog = document.getElementById("yourcode").value;
   var mypre = document.getElementById("output");
   mypre.innerHTML = '';
   Sk.canvas = "mycanvas";
   Sk.pre = "output";
   Sk.configure({output:outf, read:builtinRead});
   try {
      eval(Sk.importMainWithBody("<stdin>",false,prog));
   }
   catch(e) {
       alert(e.toString());
   }
}

//Inserts code of program 'name' into textarea
function ins_text(f_name, f_contents) {
  var tx = document.getElementById("yourcode");
  tx.innerHTML = f_contents;
  var header = document.getElementById("st_ed_head");
  header.innerHTML = f_name; //Change title above editor to program name
}



