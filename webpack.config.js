const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isEnvProduction = argv.mode === 'production';

  return {
    mode: isEnvProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'index.web.js'),
    output: {
      path: path.resolve(__dirname, 'dist/renderer'),
      filename: isEnvProduction ? '[name].[contenthash:8].js' : 'bundle.js',
      clean: true,
      publicPath: './',
    },
    resolve: {
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
      alias: {
        'react-native$': 'react-native-web',
        'react-native-linear-gradient$': 'react-native-web',
      },
    },
    module: {
      rules: [
        {
          test: /\.(tsx?|jsx?|mjs)$/,
          // Include project source and react-native packages that need transpilation
          include: [
            path.resolve(__dirname, 'index.web.js'),
            path.resolve(__dirname, 'App.tsx'),
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'node_modules/@react-native'),
            path.resolve(__dirname, 'node_modules/@react-navigation'),
            path.resolve(__dirname, 'node_modules/react-native-safe-area-context'),
            path.resolve(__dirname, 'node_modules/react-native-screens'),
            path.resolve(__dirname, 'node_modules/@react-native-community/slider'),
            path.resolve(__dirname, 'node_modules/@react-native-async-storage'),
          ],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { chrome: '110' }, modules: false }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                '@babel/preset-typescript',
              ],
              plugins: [
                ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
              ],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'desktop/index.html'),
        inject: true,
      }),
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isEnvProduction),
        'process.env.NODE_ENV': JSON.stringify(isEnvProduction ? 'production' : 'development'),
      }),
    ],
    performance: {
      hints: false,
    },
    devtool: isEnvProduction ? false : 'eval-source-map',
  };
};
