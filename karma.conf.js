module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: './',

    frameworks: ['mocha','sinon-chai'],

    // list of files / patterns to load in the browser
    files: require('./include.conf')
      .concat([
        'tests/Function.prototype.bind_polyfill.js',
        'tests/client/preload.js',
        'tests/client/unit/helpers.js',
        'tests/client/**/*.js',
        { pattern: 'tests/mock/models/*.json', watched: true, served: true, included: false },
        { pattern: 'tests/mock/textures/**/*.png', watched: true, served: true, included: false }
      ]),

    // list of files to exclude
    exclude: [
    ],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['progress', 'coverage'],

    // web server port
    // CLI --port 9876
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: false,

    preprocessors: {
      // Source files you want to generate coverage reports for
      // This should not include tests or libraries
      // These files will be instrumented by Istanbu
      'client/game/**/*.js': ['coverage'],
      'client/game/*.js': ['coverage'],
    },

    // Configure the reporter
    coverageReporter: {
      type: 'html',
      dir: 'coverage/client/'
    },

    // global config for SauceLabs
    sauceLabs: {
      startConnect: true,
      testName: 'Satellite unit tests'
    },

    // define SL browsers
    customLaunchers: {
      sl_chrome_OSX9: {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: '31',
        platform: 'OS X 10.9'
      }
    },

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: process.env.TRAVIS ? [ 'sl_chrome_7' ] : [ 'Chrome' ],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 5000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: true,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    plugins: [
      'karma-coverage',
      'karma-mocha',
      'karma-sinon-chai',
      'karma-sauce-launcher',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ]
  });
};
