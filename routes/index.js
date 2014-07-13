exports.home = function (req, res) {
  res.render('home_page');
}

exports.resources = function (req, res) {
  res.render('resources_page');
}

exports.files = function (req, res) {
  res.render('files_page');
}

exports.editor = function (req, res) {
  res.render('editor_page');
}

exports.login = function (req, res) {
  res.render('login_page');
}

exports.all = function (req, res) {
  res.send('Error 404: File not found');
}
