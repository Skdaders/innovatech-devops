process.env.CHROME_BIN = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
console.log('CHROME_BIN path:', process.env.CHROME_BIN);

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
   

    // Incluye setup y todos los archivos de test
    files: [
      { pattern: 'src/__tests__/test-setup.js', type: 'module', included: true },
      { pattern: 'src/**/*.spec.jsx', watched: false },
      { pattern: 'src/**/*.spec.js', watched: false }
    ],

    preprocessors: {
      'src/**/*.spec.jsx': ['webpack'],
      'src/**/*.spec.js': ['webpack'],
      'src/__tests__/test-setup.js': ['webpack']
    },

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react'
                ],
                plugins: ['istanbul'] // mantiene cobertura
              }
            }
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
          }
        ]
      },
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.js', '.jsx']
      }
    },

    browsers: ['Chrome'],

    reporters: ['progress', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'text-summary'],
      fixWebpackSourcePaths: true
    },

    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-webpack',
      'karma-sourcemap-loader',
      'karma-coverage-istanbul-reporter'
    ],

    singleRun: false,
    autoWatch: true,
    colors: true,
    logLevel: config.LOG_INFO,
    port: 9876
  });
};
