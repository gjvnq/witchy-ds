'use strict';

const gulp = require('gulp');
const sass = require('sass');
const gulp_sass = require('gulp-sass')(sass);
const gulp_clean = require('gulp-clean');
const browser_sync = require("browser-sync").create();
const sourcemaps = require('gulp-sourcemaps');

function clean() {
    return gulp.src('build/**', {read: false}).pipe(gulp_clean());
}

const src_scss = 'src/scss/**/*.scss';
const src_scss_exception = '!src/scss/**/_*.scss'
function compile_scss() {
    return gulp.src([src_scss, src_scss_exception])
        .pipe(sourcemaps.init())
        .pipe(gulp_sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/css/'));
}

const src_css = 'src/**/*.css';
function copy_css() {
    return gulp.src(src_css)
        .pipe(gulp.dest('build/'));
}

const src_fonts = 'src/fonts/**/*.woff2';
function copy_fonts() {
    return gulp.src(src_fonts)
        .pipe(gulp.dest('build/fonts'));
}

const src_html = 'src/**/*.html';
function copy_html() {
    return gulp.src(src_html)
        .pipe(gulp.dest('build/'));
}

const src_js = 'src/**/*.js';
function copy_js() {
    return gulp.src(src_js)
        .pipe(gulp.dest('build/'));
}

const build = gulp.parallel(compile_scss, copy_html, copy_js, copy_css, copy_fonts);

const watcher = function() {
    gulp.watch(src_html, copy_html);
    gulp.watch(src_js, copy_js);
    gulp.watch(src_css, copy_css);
    gulp.watch(src_fonts, copy_fonts);
    gulp.watch(src_scss, compile_scss);
};

const server = function() {
    browser_sync.init({
        watch: true,
        server: "./build/",
    })
}

exports.default = gulp.series(clean, build, gulp.parallel(watcher, server));
exports.clean = clean;
exports.build = build;
