const path = require(`path`);
module.exports = {
    devtool: `eval-source-map`,
    entry: `./src/main.ts`,
    module: {
        rules: [
            {
                test: /\.ts$/, 
                use: `ts-loader`,
                include: [path.resolve(__dirname, `src`)]
            },
            {
                test: /\.png$/, 
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                        },
                    },
                ],
            }
        ]
    },
    resolve: {
        extensions: [`.ts`, `.js`]
    },
    output: {
        publicPath: `public`,
        filename: `bundle.js`,
        path: path.resolve(__dirname, `public`)
    },
    mode: `development`
}