/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const process = require('process');
require('dotenv').config();
const mode = process.env.NODE_ENV;
const analyze = process.env.ANALYZE;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

console.log(mode);

module.exports = {
	entry: {
		main: path.resolve(__dirname, '../src/index.js'),
		vendor: [
			'react',
			'react-dom',
			'scheduler',
			'object-assign',
			'@emotion/styled',
			'prop-types',
		],
	},
	output: {
		path: path.resolve(__dirname, '../dist'),
		publicPath: '/',
		filename: 'public/js/[name]-[contenthash:8].js',
		chunkFilename: 'public/js/[name]-[contenthash:8].chunk.js',
	},
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
								[
									'@babel/preset-react',
									{ runtime: 'automatic', importSource: '@emotion/react' },
								],
							],
							// don't inject babel code into each file, create a global import for them
							plugins: ['@emotion/babel-plugin', '@babel/plugin-transform-runtime'],
							compact: false,
							cacheDirectory: false,
							cacheCompression: false,
							sourceMaps: true,
							inputSourceMap: true,
						},
					},
					{
						loader: 'ts-loader',
						options: {
							compilerOptions: {
								target: 'esnext',
								module: 'esnext',
								react: 'preserve',
								lib: ['dom', 'dom.iterable', 'esnext'],
								transpileOnly: true,
							},
						},
					},
				],
			},
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				include: /src/,
				options: {
					presets: [
						'@babel/preset-env',
						'@babel/react',
						'@emotion/babel-preset-css-prop',
					],
					// don't inject babel code into each file, create a global import for them
					plugins: ['@babel/plugin-transform-runtime'],
					compact: false,
					cacheDirectory: false,
					cacheCompression: false,
					sourceMaps: false,
					inputSourceMap: false,
				},
			},
			{
				test: /\.css$/i,
				use: [
					// {
					// 	loader: MiniCssExtractPlugin.loader,
					// 	options: {
					// 		publicPath: '../../',
					// 	},
					// },
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				// eslint-disable-next-line security/detect-unsafe-regex
				test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
				type: 'asset/resource',
				generator: {
					filename: 'public/fonts/[name].[ext]',
				},
			},
			{
				test: /\.(jpg|jpeg|png|webp)?$/,
				type: 'asset',
				generator: { filename: 'public/images/[name]-[contenthash:8].[ext]' },
			},
			{
				test: /\.gif?$/,
				type: 'asset',
				generator: { filename: 'public/gif/[name]-[contenthash:8].[ext]' },
			},
			{
				test: /\.m4v?$/,
				type: 'asset',
				generator: { filename: 'public/video/[name]-[contenthash:8].[ext]' },
			},
			{
				test: /\.pdf$/,
				type: 'asset',
				generator: { filename: 'public/pdf/[contenthash:3]-[name].[ext]' },
			},
			{
				test: /\.svg$/,
				use: [
					'babel-loader',
					{
						loader: 'react-svg-loader',
						options: {
							svgo: {
								plugins: [{ removeDimensions: true, removeViewBox: false }],
								floatPrecision: 2,
							},
						},
					},
				],
			},
		],
	},
	resolve: {
		alias: {
			icons: path.resolve(__dirname, '../src/assets/icons'),
			assets: path.resolve(__dirname, '../src/assets'),
			pictures: path.resolve(__dirname, '../src/static/Pictures.js'),
		},
		modules: ['src', 'node_modules'],
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
	optimization: {
		minimizer: [/*new OptimizeCssAssetsPlugin(),*/ new TerserPlugin()],
		splitChunks: {
			chunks: 'all',
		},
	},
	experiments: { asyncWebAssembly: true },
	// prettier-ignore
	plugins: [
		analyze === 'true'
			? new BundleAnalyzerPlugin({
				analyzerMode: 'server',
			})
			: false,
		// new MiniCssExtractPlugin({
		// 	filename: 'public/css/[name]-[contenthash:8].css',
		// 	chunkFilename: 'public/css/[name]-[contenthash:8].chunk.css',
		// }),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../src/index.html'),
			filename: 'index.html',
		}),
		new CleanWebpackPlugin(),
		new webpack.DefinePlugin({
			BACKEND_SERVER_URL: JSON.stringify(process.env.BACKEND_URL),
		})
	].filter(Boolean),
};
