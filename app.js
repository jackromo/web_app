var express = require('express');
var router = require('./routes');
var flash = require('connect-flash'); //Needed to display error messages from passport
var fs = require('fs');

//Needed for managing accounts and users
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');









app.use(express.urlencoded());

//Many files are in /public, so app.js will now look there primarily
app.use(express.static(__dirname + "/public"));


//These lines allow for processing cookies to keep track of active users and what they are doing.
app.use(express.cookieParser());
app.use(express.session({'secret': 'key'}));
app.use(passport.initialize());
app.use(passport.session());


//Express bodyparser does not understand /text/plain type in requests, this allows it to parse it
app.use(function(req, res, next){
  if (req.is('text/plain')) {
    //Creates a text attribute, sets encoding to plain text
    req.text = '';
    req.setEncoding('utf8');
    //When data is received, append it to req.text; when request ends, terminate
    req.on('data', function(chunk){ req.text += chunk });
    req.on('end', next);
  } else {
    next();
  }
});









//Import the json file of usernames and passwords.
var accounts = require('./accounts.json');


//These functions are used to search the accounts.json file for a user.
function findByUsername (username, fn) {
  var users = accounts.users;
  for (var i = 0, len = users.length; i < len; i++) {
    var user = accounts.users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

function findById(id, fn) {
  var users = accounts.users;
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

//These functions are needed by passport to maintain active user sessions.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
          done(err, user);
            });
});


//Setting the method for logins (this is called when the login form is received)
passport.use( new LocalStrategy (
  function (username, password, done) {
    process.nextTick(function () {
      findByUsername(username, function(err, user) {
          //Now checks if received username was correct or not
          if (err) { return done(err); }
          if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
          if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
          return done(null, user);
      });
    });
  }
));









//Routing requests here (see index.js for router functions)

app.get('/', router.home);
app.get('/resources', router.resources);
app.get('/resources_:chapter?', router.chap); //Access chapter in tutorial within resources
app.get('/editor', router.editor);
app.get('/login', router.login);

//Loads files page for user
app.get('/files', function(req, res) {
  if(req.user) {
    var dir = "./public/user_files/" + req.user.username + "/";
    var user_files = []; //Will contain array of objects about files, with props 'name' and 'contents'
    // Will gather info about every program user has written and send them to files page
    fs.readdir(dir, function(err, files) {
      if(err) throw err;
      //Loops through all file names, opening each and reading contents
      for(var i = 0; i < files.length; i++) {
        //readFileSync makes file reading synchronous, so in correct order
        var data = fs.readFileSync(dir + files[i], 'utf8');
        user_files.push({name: files[i], contents: data});
      }
      res.render('layout', {page: "files", user: req.user, files: user_files});
    });
  }
  else
    res.render('layout', {page: "files", files: []});
});


//Called when user attempts to log in (for POST request, see index.js for GET)
app.post('/login',
  //Authenticate user - if failure, send to /login, if success, send to homepage
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});


//Called when user attempts to create new account
app.post('/signup', function(req, res) {
  //Allows for new account creation
  //The id of the new_user is just which user they are (1rst, 2nd, 3rd, etc.)
  console.log('Making new account for ' + req.body.username);
  //Must check if username exists; if so, try again
  for(var i = 0; i < accounts.users.length; i++) {
    if(accounts.users[i].username == req.body.username) {
      res.redirect('/login');
      return null;
    }
  }
  //Create object of new user, then push in list of users
  var new_user = {id: accounts.users.length+1, username: req.body.username, password: req.body.password};
  accounts.users.push(new_user);
  console.log('New accounts.users: ' + accounts.users);
  //Must overwrite old accounts.json file with new username added
  fs.writeFile('accounts.json', JSON.stringify(accounts, null, 4));
  //Makes directory for new user to store custom code
  fs.mkdir('./public/user_files/' + req.body.username + '/', function(err) {
    if(err) throw err;
    console.log('Made file for ' + req.body.username);
  });
  //Log in as new user
  req.login(new_user, function(err) {
    if (err) throw err;
    return res.redirect('/');
  });
});


//Called when user saves changes to old file
app.post('/save_old/:name?', function(req, res) {
  var name = req.params.name; //Name of file to save to

  //Make sure that request has 'text' parameter
  if(typeof req.text != undefined) {
    path = './public/user_files/' + req.user.username + '/' + name;
    //Write text to file at above path
    fs.writeFile(path, req.text, function(err) {
      if (err) throw err;
    });
  } else {
    console.log("XMLHttpRequest does not have text attribute");
  }
});


//Called when user deletes file 'name'
app.post('/remove/:name?', function(req, res) {
  var name = req.params.name;
  var path = './public/user_files/' + req.user.username + '/' + name;
  fs.unlink(path, function(err) {
    if (err) throw err;
    console.log("Successfully removed " + path);
  });
});


//Called when user creates new file
app.post('/new_prog/:name?', function(req, res) {
  var name = req.params.name;
  var path = './public/user_files/' + req.user.username + '/' + name;
  //Check if file exists; if it doesn't, create file
  fs.exists(path, function(exists) {
    if(!exists) {
      //fs.open with 'w' flag creates file if it doesn't exist
      fs.open(path, 'w');
      console.log("Created new file " + path);
    } else console.log("Attempted to create existing file " + path);
  });
});


//Called when user signs out
app.get('/signout', function(req, res) {
  //Sign out user
  req.logout();
  res.redirect('/');
});


app.get('*', router.all); //All unrecognized requests are caught here


app.listen(3000); //Set to be port you are using (testing with 3000)
