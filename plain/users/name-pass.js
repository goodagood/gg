
/*
 * Re-write functions (middle-wares) to do name/password login.
 * Before, we put it in app.js (app.818.js etc.), and used passport.js' own
 * authentication function as the middle-ware, it can only point to url of
 * success or fail, we need more control.
 *
 * 2016 0201
 */

// todo with this example
app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/users/' + user.username);
        });
    })(req, res, next);
});

/*
 * http://passportjs.org/docs
 *
   In the above example, note that authenticate() is called from within the route
   handler, rather than being used as route middleware. This gives the callback
   access to the req and res objects through closure.

   If authentication failed, user will be set to false. If an exception occurred,
   err will be set. An optional info argument will be passed, containing
   additional details provided by the strategy's verify callback.

   The callback can use the arguments supplied to handle the authentication result
   as desired. Note that when using a custom callback, it becomes the
   application's responsibility to establish a session (by calling req.login())
   and send a response.
 */


