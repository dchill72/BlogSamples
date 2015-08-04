var gulp = require('gulp');
var del = require('del');
var inject = require('gulp-inject');

var appSources = [
    './app/js/app.js',
    './app/js/app-config.js',
    './app/js/services/*.js',
    './app/js/common/*.js',
    './app/**/*.js',
    '!app/**/*.min.js'
];

var appSourcesAndCSS = [
    './app/js/app.js',    
    './app/js/app-config.js',
    './app/js/**/*.js',
    './app/js/services/*.js',
    './app/js/common/**/*.js',
    './app/js/**/partials/*.js',
    '!app/**/*.min.js',
    './app/**/*.css'
];

var thirdPartySources = [
    './bower_components/jquery/dist/jquery.js',
    './bower_components/angular/angular.js',
    './bower_components/angular-route/angular-route.js',
    './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    './bower_components/bootstrap/dist/js/bootstrap.js',
    './bower_components/bootstrap/dist/css/bootstrap.css'
];

var debugInjectSrcs = [
    './dist/lib/jquery.js',
    './dist/lib/angular.js',
    './dist/lib/*.js',
    './dist/lib/*.css'
];

gulp.task('clean', function () {
    del.sync(['dist/**/*', 'dist/*'], { force: true })
});

gulp.task('thirdParty', ['clean'], function () {

    gulp.src(['./bower_components/bootstrap/dist/fonts/*'])
        .pipe(gulp.dest('./dist/fonts'));

    return gulp.src(thirdPartySources)
        .pipe(gulp.dest('./dist/lib'));
});

gulp.task('debugIndex', ['thirdParty'], function () {
    var target = gulp.src('./index.html');
    
    var appSources = gulp.src(appSourcesAndCSS, { read: false });
    var libSources = gulp.src(debugInjectSrcs, { read: false });

    return doInject(target, appSources, libSources);
});

var doInject = function (target, appSrc, libSrc) {

    var thirdPartyCSS = gulp.src(['./dist/lib/*.css']);

    return target.pipe(inject(libSrc, { name: 'thirdparty', addRootSlash: false }))
        .pipe(inject(thirdPartyCSS, { name: 'thirdpartycss', addRootSlash: false }))
        .pipe(inject(appSrc, { addRootSlash: false }))
        .pipe(gulp.dest('./'));
};

gulp.task('default', ['debugIndex'], function () { });
