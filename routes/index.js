//Routes all client requests.

//NB: Every callback here checks for whether user is logged in or not.
//This is mainly to render the header with the usermenu.ejs file for now.

exports.home = function (req, res) {
  if(req.user)
    res.render('home_page', {user: req.user});
  else
    res.render('home_page');
}

exports.resources = function (req, res) {
  if(req.user)
    res.render('resources_page', {user: req.user});
  else
    res.render('resources_page');
}

//Not currently in use, see app.js for currently used callback
exports.files = function (req, res) {
  if(req.user)
    res.render('files_page', {user: req.user});
  else
    res.render('files_page');
}

exports.editor = function (req, res) {
  if(req.user)
    res.render('editor_page', {user: req.user});
  else
    res.render('editor_page');
}

exports.login = function (req, res) {
  if(req.user)
    res.render('login_page', {user: req.user});
  else
    res.render('login_page');
}


//Catch-all route, unrecognized route was requested
exports.all = function (req, res) {
  res.send('Error 404: File not found');
}
