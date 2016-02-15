var gulp = require('gulp'),
    rename = require('gulp-rename'),
    template = require('gulp-template'),
    htmlmin = require('gulp-htmlmin'),
    replace = require('gulp-replace'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    cleancss = require('gulp-cleancss'),
    pngquant = require('imagemin-pngquant'),
    imagemin = require('gulp-imagemin'),
    ftp = require('vinyl-ftp');

gulp.task('ios', function () {
    var js_prefix = "src/js",
        css_prefix = "src/css",
        js_files = [
            "extend.js",
            "helpers.js",
            "preloader.js",
            "time.js",
            "inobounce.js",
            "app.js",
            "api.js",
            "storage.js",
            "input.js",
            "platform/pc.js",
            "platform/lg.js",
            "channels.js",
            "app_bar.js",
            "control_bar.js",
            "menu-m.js",
            "auth-ios.js",
            "player.js",
            "remote.js",
            "main.js"
        ],
        css_files = [
            "fonts.css",
            "icons.css",
            "global.css",
            "menu-m.css",
            "auth.css",
            "app_bar.css",
            "control_bar.css"
        ];
    js_files = js_files.map(function (file) {
        return js_prefix + "/" + file;
    });
    css_files = css_files.map(function (file) {
        return css_prefix + "/" + file;
    });
    gulp.src(js_files)
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('build/ios'));
    gulp.src(css_files)
        .pipe(replace(/\.\.\//g, ''))
        .pipe(cleancss())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest('build/ios'));
    gulp.src("./src/template.html")
        .pipe(template({
            title: "Ланет TV Mobile",
            css: "app.min.css",
            js: "app.min.js"
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(rename("index.html"))
        .pipe(gulp.dest('build/ios'));
    gulp.src("src/favicon.ico")
        .pipe(gulp.dest('build/ios'));
    gulp.src("src/assets/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('build/ios/assets'));
});

gulp.task('deploy-ios', function () {
    var config = require('./ftp.json'),
        conn = ftp.create({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.pass
        });
    return gulp.src("build/ios/**/*")
        .pipe(conn.newer('/'))
        .pipe(conn.dest('/'));
});
