var gulp = require('gulp');
var stylus = require('gulp-stylus');
var when = require('when');

var concat = require('gulp-concat');
var minifyJS = require('gulp-uglify');
var deploy = require("gulp-gh-pages");
var static = require('node-static');

var file = new static.Server('./out');
function runServer(port) {
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            file.serve(request, response);
        }).resume();
    }).listen(port || 9000);
}

// // compile css
gulp.task('stylus', function () {
    return gulp.src('./css/[!_]*.styl')
        .pipe(stylus({use: ['nib']}))
        .pipe(gulp.dest('./out'))
});

// copy over everything from the static folder (images, etc)
// NOTE: into the root of the out folder
gulp.task('static', function(){
    return gulp.src('./static/**')
        .pipe(gulp.dest('./out'));
});

gulp.task('scripts', function(){
    var tasks = [];

    tasks.push( 
        gulp.src([
            './js/stripe.js',
            './js/jquery.js',
            './js/jquery.typewatch.js',
            './js/jquery.payment.js',
            './js/main.js'
        ])
        .pipe(concat('event.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest('./out'))
    )

    tasks.push(
        gulp.src([
            './js/jquery.js',
            './js/jquery.typewatch.js',
            './js/mentors.js'
        ])
        .pipe(concat('mentors.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest('./out'))
    )

    tasks.push(
        gulp.src([
            './js/jquery.js',
            './js/jquery.typewatch.js',
            './js/complete.js'
        ])
        .pipe(concat('complete.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest('./out'))
    )

    tasks.push(
        gulp.src([
            './js/marked.js',
            './js/angular.js',
            './js/ng-sanitize.js',
            './js/projects.js'
        ])
        .pipe(concat('projects.js'))
        .pipe(minifyJS())
        .pipe(gulp.dest('./out'))
    )

    return when.all(tasks);
});

gulp.task('default', ['static', 'scripts', 'stylus']);

gulp.task('deploy', ['static', 'scripts', 'stylus'], function () {
    var remote = "https://github.com/gopilot/static.git";

    return gulp.src("./out/**/*")
        .pipe( deploy( remote ) );
});

gulp.task('watch', function() {
    runServer();
    gulp.watch('./static/**', ['static']);
    gulp.watch('./css/*.styl', ['stylus']);
    gulp.watch('./js/**/*.js', ['scripts'])
});
