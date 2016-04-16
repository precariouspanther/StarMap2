'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');
var path = require('path');
var cleanCSS = require('gulp-clean-css');
var notify = require('gulp-notify');
var sourcemaps = require('gulp-sourcemaps');

(function () {
    var scriptsPath = 'scripts';
    var distPath = 'dist';
    gulp.task('build:starmap', function () {
        gulp.src(path.join(scriptsPath, '/**/*.js'))
            .pipe(sourcemaps.init())
            .pipe(concat('starmap.js'))
            .pipe(gulp.dest(distPath))
            .pipe(uglify({mangle: false}))
            .pipe(rename('starmap.min.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(distPath));

        gulp.src(path.join(scriptsPath, '/**/*.css'))
            .pipe(concat('starmap.css'))
            .pipe(gulp.dest(distPath))
            .pipe(cleanCSS())
            .pipe(rename('starmap.min.css'))
            .pipe(gulp.dest(distPath))
            .pipe(notify({message: 'Resource build completed.'}));
    });

    gulp.task('watch:starmap', function () {
        gulp.watch(path.join(scriptsPath, '/**/*.js'), ['build:starmap']);
        gulp.watch(path.join(scriptsPath, '/**/*.css'), ['build:starmap']);
    });

})();

gulp.task('default', [
    'build:starmap',
    'watch:starmap'
]);