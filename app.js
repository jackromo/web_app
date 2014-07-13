var express = require('express');
var router = require('./routes');

var app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//Many files are in /public, so app.js will now look there primarily
app.use(express.static(__dirname + "/public"));

//These lines allow for processing cookies to keep track of active users and what they are doing.
app.use(express.cookieParser());
app.use(express.session({'secret': 'key'}));

//Import the json file of usernames and passwords.
var accounts = require('./accounts.json');

//Routing requests here

app.get('/', router.home);
app.get('/resources', router.resources);
app.get('/files', router.files);
app.get('/editor', router.editor);
app.get('/login', router.login);

app.get('*', router.all);

app.listen(3000);
