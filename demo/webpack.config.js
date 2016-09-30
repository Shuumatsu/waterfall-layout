const webpack = require('webpack');

module.exports = {
    entry: {
        main: './demo/demo.ts',
    },
    output: {
        filename: './demo/demo.js',
    },
    resolve: {
        extensions: ['', '.js', '.ts']
    },
    module: {
        loaders: [{
            test: /\.ts$/,
            loaders: ['babel?presets[]=es2015', 'awesome-typescript-loader']
        }]
    }
};