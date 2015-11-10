var myuser = require('./myuser.js');

function testpath(app){
  app.get('/testa', function(req, res){
    res.render('testa', { user: req.user, message: req.flash('error') });
  });

  app.get('/adduser', function(req, res){
    res.render('adduser', { user: req.user, message: req.flash('error') });
  });

  app.post('/adduser', function(req, res){

    var username = req.body.username;
    var password = req.body.password;
    var repeat_password = req.body.repeat_password;
    var referrer = req.body.referrer;

    var user = {};
    user.username = req.body.username;
    user.password = req.body.password;
    user.repeat_password = req.body.repeat_password;
    user.referrer = req.body.referrer;
    myuser.add_user(user);

    console.log(username, password, repeat_password, referrer);
    res.redirect('/login')
  });
}

exports.testpath = testpath;
// vim: set et ts=2 sw=2:
