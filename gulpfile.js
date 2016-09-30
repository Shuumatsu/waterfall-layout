const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const tsProject = typescript.createProject('tsconfig.json');

// const webpack = require('gulp-webpack');

gulp.task('ts', () => {
    return gulp.src('./src/index.ts')
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch-ts', () => {
    return gulp.watch('./src/index.ts', ['ts']);
});