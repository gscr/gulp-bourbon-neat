var bourbon = require("bourbon").includePaths;
var neat = require("bourbon-neat").includePaths;
var gulp = require("gulp");
var nunjucksRender = require('gulp-nunjucks-render');

var browsersync = require('browser-sync');
var concat = require("gulp-concat");
var cssnano = require('cssnano');
var cssnext = require('postcss-cssnext');
var del = require("del");
var imagemin = require('gulp-imagemin');
var jshint = require('gulp-jshint');
var postcss = require('gulp-postcss');
var sass = require("gulp-sass");
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var paths = {
	dist: ['dist'],
    scss: ['source/assets/scss'],
    js: ['source/assets/js'],
    img: ['source/assets/img'],
    pages: ['source/pages'],
    templates: ['source/templates']
};

gulp.task('styles', function() {
    return gulp.src(paths.scss+'/*.scss')
        .pipe(sass({ includePaths: [bourbon, neat], outputStyle: 'compact' }))
        .pipe(concat('styles.css'))
        .pipe(postcss([
            cssnext()
        ]))
        .pipe(gulp.dest(paths.dist+'/css'));
});

gulp.task('build_styles', function() {
    return gulp.src(paths.scss+'/*.scss')
        .pipe(sass({ includePaths: [bourbon, neat]}))
        .pipe(concat('styles.css'))
        .pipe(postcss([
            cssnext(),
            cssnano({ autoprefixer: false })
        ]))
        .pipe(gulp.dest(paths.dist+'/css'));
});

gulp.task('scripts', function() {
    return gulp.src(paths.js+'/*.js')
        .pipe(sourcemaps.init())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(paths.dist));
});

gulp.task('images', function() {
    return gulp.src(paths.img+'/*')
        .pipe(imagemin())
        .pipe(gulp.dest(paths.dist+'/img'))
});

gulp.task('nunjucks', function() {
    return gulp.src(paths.pages+'/**/*.html')
        .pipe(nunjucksRender({
            path: paths.templates
        }))
        .pipe(gulp.dest(paths.dist))
});

gulp.task('browsersync', function() {
    return browsersync({
        server: {
            baseDir: paths.dist
        }
    });
});

gulp.task('clean', function() {
    return del([paths.dist+'/*']);
});

// workaround for browsersync hanging when reloading after scss updates
function reloadBrowserSync(cb) {
    browsersync.reload();
    cb();
}

gulp.task('watch', function() {
    gulp.watch(paths.pages+'/**/*.html', gulp.series('nunjucks', reloadBrowserSync));
    gulp.watch(paths.scss+'/**/*.scss', gulp.series('styles', reloadBrowserSync));
    gulp.watch(paths.js+'/*.js', gulp.series('scripts', reloadBrowserSync));
    gulp.watch(paths.img+'/*', gulp.series('images', reloadBrowserSync));
});

gulp.task("default", gulp.parallel("styles", "images", "nunjucks", "browsersync", "watch"));
gulp.task("build", gulp.parallel("build_styles", "images", "nunjucks"));