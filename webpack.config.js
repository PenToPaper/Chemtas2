module.exports = (env) => {
    return require(`./webpack.${env.mode}.js`);
};
