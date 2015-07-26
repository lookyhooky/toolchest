var gulp = require('gulp')
var standard = require('gulp-standard')

gulp.task('standard', function() {
  return gulp.src(['./toolchest.js'])
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: false
    }))
})

gulp.task('watch', function() {
  gulp.watch('./toolchest.js', ['standard'])
})

gulp.task('default', ['standard'])
