var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: [
        './src/client/app.js'
    ],
    output: {
        path: path.join(__dirname, 'dist', 'static'),
        filename: 'bundle.js'
    },
    module: {
        loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
        },
        {
            test: /\.html$/,
            loader: 'raw'
        },
        {
            test: [/\.css$/, /\.scss$/],
            loader: ExtractTextPlugin.extract('css?sourceMap!postcss-loader?sourceMap!sass?sourceMap')
        }
        ]
    },

    postcss: {},

    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(en)$/),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new ExtractTextPlugin('styles.css'),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new CopyWebpackPlugin([{
            from: __dirname + '/src/public'
        }], {
            ignore: [
                '*.scss'
            ]
        })
    ]
};
