'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var argv = require('yargs').argv;
var replace = require('gulp-replace');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
  return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
    .pipe(replace('@@BASE_URL', argv.standalone ? conf.baseUrl : ''))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')))
    .pipe($.size())
    .pipe(browserSync.reload({ stream: true }));
});
