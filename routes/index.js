//Routes all client requests.

//NB: Every callback here checks for whether user is logged in or not.
//This is mainly to render the header with the usermenu.ejs file for now.

exports.home = function (req, res) {
  if(req.user)
    res.render('layout', {page: "home", user: req.user});
  else
    res.render('layout', {page: "home"});
}

exports.resources = function (req, res) {
  if(req.user)
    res.render('layout', {page: "resources", user: req.user});
  else
    res.render('layout', {page: "resources"});
}

//Not currently in use, see app.js for currently used callback
exports.files = function (req, res) {
  if(req.user)
    res.render('layout', {page: "files", user: req.user});
  else
    res.render('layout', {page: "files"});
}


exports.editor = function (req, res) {
  if(req.user)
    res.render('layout', {page: "editor", user: req.user});
  else
    res.render('layout', {page: "editor"});
}

exports.login = function (req, res) {
  if(req.user)
    res.render('layout', {page: "login", user: req.user});
  else
    res.render('layout', {page: "login"});
}


//Catch-all route, unrecognized route was requested
exports.all = function (req, res) {
  res.send('Error 404: File not found');
}
