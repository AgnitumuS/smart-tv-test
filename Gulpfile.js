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

gulp.task('mobile', function () {
    var dest = "./build/mobile",
        js_prefix = "src/js",
        css_prefix = "src/css",
        js_files = [
            "extend.js",
            "helpers.js",
            "preloader.js",
            "time.js",
            "inobounce.js",
            "app.js",
            "analytics.js",
            "api.js",
            "storage.js",
            "input.js",
            "platform/pc.js",
            "channels.js",
            "app_bar.js",
            "control_bar.js",
            "clock.js",
            "menu.js",
            "auth.js",
            "player.js",
            "remote.js",
            "main.js"
        ],
        css_files = [
            "fonts.css",
            "icons.css",
            "global.css",
            "menu.css",
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
        .pipe(gulp.dest(dest));
    gulp.src(css_files)
        .pipe(replace(/\.\.\//g, ''))
        .pipe(cleancss())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest(dest));
    gulp.src("./src/template.html")
        .pipe(template({
            title: "Ланет TV",
            css: "app.min.css",
            js: "app.min.js",
            analytics: false
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(rename("index.html"))
        .pipe(gulp.dest(dest));
    gulp.src("src/favicon.ico")
        .pipe(gulp.dest(dest));
    gulp.src("src/assets/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dest + '/assets'));
});

gulp.task('mobile.analytics', function () {
    var dest = "./build/mobile.analytics",
        js_prefix = "src/js",
        css_prefix = "src/css",
        js_files = [
            "extend.js",
            "helpers.js",
            "preloader.js",
            "time.js",
            "inobounce.js",
            "app.js",
            "analytics.js",
            "api.js",
            "storage.js",
            "input.js",
            "platform/pc.js",
            "channels.js",
            "app_bar.js",
            "control_bar.js",
            "clock.js",
            "menu.js",
            "auth.js",
            "player.js",
            //"remote.js",
            "main.js"
        ],
        css_files = [
            "fonts.css",
            "icons.css",
            "global.css",
            "menu.css",
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
        .pipe(gulp.dest(dest));
    gulp.src(css_files)
        .pipe(replace(/\.\.\//g, ''))
        .pipe(cleancss())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest(dest));
    gulp.src("./src/template.html")
        .pipe(template({
            title: "Ланет TV",
            css: "app.min.css",
            js: "app.min.js",
            analytics: require('./analytics.json')
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(rename("index.html"))
        .pipe(gulp.dest(dest));
    gulp.src("src/favicon.ico")
        .pipe(gulp.dest(dest));
    gulp.src("src/assets/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dest + '/assets'));
});

gulp.task('tv', function () {
    var dest = "./build/tv",
        js_prefix = "src/js",
        css_prefix = "src/css",
        js_files = [
            "extend.js",
            "helpers.js",
            "preloader.js",
            "time.js",
            "inobounce.js",
            "app.js",
            "analytics.js",
            "api.js",
            "storage.js",
            "input.js",
            "platform/pc.js",
            "platform/lg.js",
            "platform/dune.js",
            "platform/samsung.js",
            "channels.js",
            "app_bar.js",
            "control_bar.js",
            "clock.js",
            "menu-tv.js",
            "auth-tv.js",
            "player.js",
            "remote.js",
            "main.js"
        ],
        css_files = [
            "fonts.css",
            "icons.css",
            "global.css",
            "menu-tv.css",
            "auth-tv.css",
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
        .pipe(gulp.dest(dest));
    gulp.src(css_files)
        .pipe(replace(/\.\.\//g, ''))
        .pipe(cleancss())
        .pipe(concat('app.min.css'))
        .pipe(gulp.dest(dest));
    gulp.src("./src/template.html")
        .pipe(template({
            title: "Ланет TV",
            css: "app.min.css",
            js: "app.min.js",
            analytics: false
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(rename("index.html"))
        .pipe(gulp.dest(dest));
    gulp.src("src/favicon.ico")
        .pipe(gulp.dest(dest));
    gulp.src("src/assets/**/*")
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dest + '/assets'));
});
