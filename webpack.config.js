var webpack = require('webpack');
var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'webpack-dev-server/client?http://127.0.0.1:3001/',
        'webpack/hot/only-dev-server',
        './src/client/app.js'
    ],
    output: {
        path: path.join(__dirname, 'dist', 'static'),
        publicPath: '/',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel',
            query: {
                presets: 'react-hmre'
            }
        },
        {
            test: /\.html$/,
            loader: 'raw'
        },
        {
            test: /\.css/,
            loader: 'style!css'
        },
        {
            test: /\.scss$/,
            loaders: [
                'style',
                'css',
                'postcss',
                'sass?outputStyle=expanded'
            ]
        },
        {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            loader: 'file'
        }]
    },

    postcss: {},

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new CopyWebpackPlugin([{
            from: __dirname + '/src/public'
        }])
    ],
    devServer: {
        port: 3001,
        hot: true,
        proxy: {
            '*': 'http://localhost:3000'
        }
    }
};
