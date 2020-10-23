const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: "./src/js/main.js",
    },
    output: {
        filename: "./js/[name].js",
        publicPath: "",
    },
    devtool: "inline-source-map",
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
                use: [{ loader: MiniCssExtractPlugin.loader, options: { publicPath: "../" } }, { loader: "css-loader" }, { loader: "resolve-url-loader" }, { loader: "sass-loader", options: { sourceMap: true } }],
            },
            {
                include: /assets/,
                test: /\.(png|jpe?g|gif|svg|xml|webmanifest|ico)$/i,
                loader: "file-loader",
                options: {
                    name: "[path][name].[ext]",
                    context: "src",
                },
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "./styles/[name].css",
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
    devServer: {
        port: 7000,
        open: true,
        host: "0.0.0.0",
        contentBase: ["./dist"],
        watchContentBase: true,
        historyApiFallback: {
            rewrites: [{ from: /^\/$/, to: "/index.html" }],
        },
    },
};
