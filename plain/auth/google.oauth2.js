/* 2016 0202, use google oauth2 */

var path   = request("path");
var secret = require("../config/secret-dir.js");

var id_file  = secret.locations.google_id_file;
var idsecret = require(id_file);

const GOOGLE_CLIENT_ID     = idsecret.id;
const GOOGLE_CLIENT_SECRET = idsecret.secret;

passport.use(new GoogleStrategy({
        clientID:     GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://goodogood.me/auth/google",
        passReqToCallback   : true
    },
    function(request, accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));



