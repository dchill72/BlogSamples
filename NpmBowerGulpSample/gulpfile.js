var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
var templateCache = require('gulp-angular-templatecache');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');

var isRelease = process.env.CFG_NAME == 'Release';

console.log('Release build? ' + isRelease);

gulp.task('cacheTemplates', function () {
    var htmlOpts = {
        conditionals: true,
        spare: true
    };

    var tplOpts = {
        filename: 'app.tpls.js',
        root: 'app',
        standalone: true
    };

    gulp.src(['app/**/*.html', 'app/js/**/*.html'])
      .pipe(minifyHtml(htmlOpts))
      .pipe(templateCache(tplOpts))
      .pipe(gulp.dest('dist/app'));
});

gulp.task('watchHtml', function () {
    gulp.watch('./app/js/**/*.html', ['cacheTemplates']);
});

var appMinifySrcs = [
    './app/js/app.js',
    './app/js/app-config.js',
    './app/js/**/*.js',
    './app/js/services/*.js',
    './app/js/common/**/*.js',
    './app/js/**/partials/*.js',
    '!app/**/*.min.js'
]

var appJs = [
    './app/js/app.js',    
    './app/js/app-config.js',
    './app/js/**/*.js',
    './app/js/services/*.js',
    './app/js/common/**/*.js',
    './app/js/**/partials/*.js',
    './dist/app/app.tpls.js',
    '!app/**/*.min.js'    
];

var appCss = [
    './app/**/*.css'
];

var minifiedAppJs = [
    './dist/app/app.min.js',
    './dist/app/app.tpls.js'
];

var minifiedAppCss = [
    './dist/app/app.min.css',
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

var clean = function () {
    del.sync(['dist/**/*', 'dist/*'], { force: true })
};

var minifyAppJs = function () {
    gulp.src(appMinifySrcs)
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/app'));
};

var minifyAppCss = function () {    
    return gulp.src(appCss)
        .pipe(concat('app.min.css'))
        .pipe(minifyCss({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist/app'));
};

var thirdParty = function () {

    gulp.src(['./bower_components/bootstrap/dist/fonts/*'])
        .pipe(gulp.dest('./dist/fonts'));

    return gulp.src(thirdPartySources)
        .pipe(gulp.dest('./dist/lib'));
};

var smartInject = function () {
    if (isRelease) {
        return releaseInject();
    }

    return debugInject();
};

var debugInject = function () {
    var target = gulp.src('./index.html');
    
    var js = gulp.src(appJs, { read: false });
    var css = gulp.src(appCss, { read: false });
    var libSources = gulp.src(debugInjectSrcs, { read: false });

    return doInject(target, js, css, libSources);
};

var releaseInject = function () {
    var target = gulp.src('./index.html');

    var js = gulp.src(minifiedAppJs, { read: false });
    var css = gulp.src(minifiedAppCss, { read: false });
    var libSources = gulp.src(debugInjectSrcs, { read: false });

    return doInject(target, js, css, libSources);
};

gulp.task('clean', clean);

gulp.task('minifyAppJs', minifyAppJs);

gulp.task('minifyAppCss', minifyAppCss);

gulp.task('thirdParty', ['clean'], thirdParty);

gulp.task('smartInject', ['thirdParty', 'minifyAppJs', 'minifyAppCss'], smartInject);

gulp.task('debugInject', ['thirdParty'], debugInject);

gulp.task('releaseInject', ['thirdParty', 'minifyAppJs', 'minifyAppCss'], releaseInject);

//stole this from here: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
};

var doInject = function (target, js, css, libSrc) {

    var thirdPartyCSS = gulp.src(['./dist/lib/*.css']);

    return target.pipe(inject(libSrc, { name: 'thirdparty', addRootSlash: false }))
        .pipe(inject(thirdPartyCSS, { name: 'thirdpartycss', addRootSlash: false }))
        .pipe(inject(js, {
            addRootSlash: false,
            transform: function (filepath) {
                return '<script src="' + filepath + '?v=' + generateUUID() + '"></script>';
            }
        }))
        .pipe(inject(css, {
            addRootSlash: false,
            transform: function (filepath) {
                return '<link rel="stylesheet" href="' + filepath + '?v=' + generateUUID() + '">';
            }
        }))
        .pipe(gulp.dest('./'));
};

gulp.task('default', ['cacheTemplates', 'smartInject'], function () { });
