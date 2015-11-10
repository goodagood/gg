

var p = console.log;

/**
 * Ensure that a user is logged in before proceeding to next route middleware.
 *
 * This middleware ensures that a user is logged in.  If a request is received
 * that is unauthenticated, the request will be redirected to a login page (by
 * default to `/login`).
 *
 * Additionally, `returnTo` will be be set in the session to the URL of the
 * current request.  After authentication, this value can be used to redirect
 * the user to the page that was originally requested.
 *
 * Options:
 *   - `redirectTo`   URL to redirect to for login, defaults to _/login_
 *   - `setReturnTo`  set redirectTo in session, defaults to _true_
 *
 * Examples:
 *
 *     app.get('/profile',
 *       ensure_login(),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensure_login('/signin'),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensure_login({ redirectTo: '/session/new', setReturnTo: false }),
 *       function(req, res) { ... });
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
function ensure_login(options) {
    if (typeof options == 'string') {
        options = { redirectTo: options }
    }
    options = options || {};

    var url = options.redirectTo || '/login';
    var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

    return function(req, res, next) {
        //p('in ensure login, session user: ', req.session, req.user);
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            //p('in ensure login');

            if (setReturnTo && req.session) {
                //p('2, in ensure login');
                req.session.returnTo = req.originalUrl || req.url;
            }
            return res.redirect(url);
        }
        //p('3, in ensure login');
        next();
    }
}



/**
 * Ensure that no user is logged in before proceeding to next route middleware.
 *
 * This middleware ensures that no user is logged in.  If a request is received
 * that is authenticated, the request will be redirected to another page (by
 * default to `/`).
 *
 * Options:
 *   - `redirectTo`   URL to redirect to in logged in, defaults to _/_
 *
 * Examples:
 *
 *     app.get('/login',
 *       ensure_logout(),
 *       function(req, res) { ... });
 *
 *     app.get('/login',
 *       ensure_logout('/home'),
 *       function(req, res) { ... });
 *
 *     app.get('/login',
 *       ensure_logout({ redirectTo: '/home' }),
 *       function(req, res) { ... });
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
function ensure_logout(options) {
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }
  options = options || {};
  
  var url = options.redirectTo || '/';
  
  return function(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return res.redirect(url);
    }
    next();
  }
}


module.exports.ensure_login  = ensure_login;
module.exports.ensure_logout = ensure_logout;


