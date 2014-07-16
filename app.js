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
app.get('/editor', router.editor);
app.get('/login', router.login);


//An old version of this exists in index.js, just here for testing file loading
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
      res.render('files_page', {user: req.user, files: user_files});
    });
  }
  else
    res.render('files_page', {files: []});
});

app.post('/login',
  /*Authenticate user - if failure, send to /login, if success, send to homepage*/
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});

app.get('/signout', function(req, res) {
  /*Sign out user*/
  req.logout();
  res.redirect('/');
});

app.get('*', router.all);


app.listen(3000);
