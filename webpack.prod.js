const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
    entry: {
        main: "./src/js/main.js",
    },
    output: {
        filename: "./js/[name].[contenthash].js",
        publicPath: "/",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{ loader: "babel-loader" }],
            },
            {
                test: /\.html$/,
                use: [{ loader: "html-loader" }],
            },
            {
                test: /\.sass$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader, options: { publicPath: "../" } },
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 3,
                        },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: ["postcss-preset-env", "autoprefixer"],
                            },
                        },
                    },
                    { loader: "resolve-url-loader" },
                    { loader: "sass-loader", options: { sourceMap: true } },
                ],
            },
            {
                include: /assets/,
                exclude: /assets\\favicons/,
                test: /\.(png|jpe?g|gif|svg|xml|webmanifest|ico)$/i,
                loader: "file-loader",
                options: {
                    name: "[path][name][contenthash].[ext]",
                    context: "src",
                },
            },
            // For favicons in particular. Unique hashes could not be reflected in html easily
            {
                include: /assets\\favicons/,
                test: /\.(png|jpe?g|gif|svg|xml|webmanifest|ico)$/i,
                loader: "file-loader",
                options: {
                    name: "[path][name]_1.[ext]",
                    context: "src",
                },
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: "./styles/[name].[contenthash].css",
        }),
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html",
            chunks: ["main"],
        }),
    ],
    optimization: {
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                },
            },
        },
    },
};
