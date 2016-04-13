var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');

gulp.task('browserSync', function() {
    browserSync.init({
        proxy: 'localhost:3000',
        reloadDelay: 500
    });
});

gulp.task('build', function() {
    return gulp.src(['public/src/js/*.js'])
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('public/dist/js'));
});

gulp.task('css', function() {
  return gulp.src('public/src/stylesheets/**/*.css')
    .pipe(autoprefixer('last 2 versions'))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('public/dist/stylesheets'));
});

gulp.task('watch', ['browserSync'], function() {
    gulp.watch('views/**/*.ejs', browserSync.reload);

    // Use in conjunction with webpack watch. Once it rebuilds, reload page.
    gulp.watch('public/dist/js/*.js', browserSync.reload);

    gulp.watch('public/src/stylesheets/**/*.css', ['css', browserSync.reload]);
});
