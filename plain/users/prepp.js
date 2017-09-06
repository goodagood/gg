
var GoogleStrategy = require("passport-google").Strategy;


function set_google(passport){

    passport.use(new GoogleStrategy({
        returnURL: 'http://54.178.88.149/auth/google/return',
        realm: 'http://54.178.88.149/'
    },
    function(identifier, profile, done) {
        //User.findOrCreate({ openId: identifier }, function(err, user) {
        //    done(err, user);
        //});
        console.log('in set google, got identifier profile:', identifier, profile);
    }));
}


function routes(app, passport){
    // Redirect the user to Google for authentication.  When complete, Google
    // will redirect the user back to the application at
    //     /auth/google/return
    app.get('/auth/google', passport.authenticate('google'));
    
    // Google will redirect the user to this URL after authentication.  Finish
    // the process by verifying the assertion.  If valid, the user will be
    // logged in.  Otherwise, authentication has failed.
    app.get('/auth/google/return', 
       passport.authenticate('google', { successRedirect: '/',
                                           failureRedirect: '/login' }));

}

module.exports.set_google = set_google;
module.exports.routes = routes;
