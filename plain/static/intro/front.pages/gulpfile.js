var gulp = require('gulp');

gulp.task('default', function() {
      // place code for your default task here
});

var concat = require('gulp-concat');

gulp.task('scripts', function() {
    return gulp.src('./lib/*.js')
           .pipe(concat('all.js'))
           .pipe(gulp.dest('./dist/'));
});
