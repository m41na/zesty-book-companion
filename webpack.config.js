const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
    entry: path.resolve(__dirname, 'react-ui/src', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devtool: 'cheap-source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: { loader: 'babel-loader' }
            },
            {
                test: /\.(jpe?g|png|gif|ico)$/i, 
                use: { loader: 'file-loader?name=[name].[ext]'}
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ]
            }
        ]
    },
    plugins: [ 
        new MiniCssExtractPlugin({}),
        new HtmlWebpackPlugin({
            title: 'React-UI',
            filename: 'index.html',
            template: 'react-ui/public/index.html',
            favicon: 'react-ui/public/favicon.ico'
        }),
        new webpack.DefinePlugin({SERVICE_NAME: JSON.stringify(process.env.SERVICE_NAME) }),
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(['dist'])
    ],
    devServer: {
        disableHostCheck: true
    }
};