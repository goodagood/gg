
/*
 * Move passport things here.
 * 2016 0611
 */


var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var m_hash_pass = require("plain/users/m-hash-pass.js");


passport.use(
    new LocalStrategy(
      function(username, password, done) {
        process.nextTick(function () {
          m_hash_pass.find_and_check(username, password, done);
        });
      }
    )
);



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  if(!user.username) return done('username is needed, it should be unique, 20160305-1728');

  // userid serve as key? 2016 0305
  return done(null, user.username);

  // Give up approaches:
  //   Once: tried to set up user id,  and let username duplicatable.
  //   as 'tmpe' has 'id': 17,
  //
  // commented out 2016 0305
  // if(typeof user.id !== 'undefined') return done(null, user.id);
  //return done('no id, no username', null);
});


var muser = require("plain/users/muser.js");
passport.deserializeUser(function(username, done) {
  muser.find_by_user_name(username, function (err, user) {
    done(err, user);
  });
});



module.exports.passport = passport;

