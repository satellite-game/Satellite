module.exports = (grunt) ->

  # Order of concatonation/minification
  includeOrder = require './include.conf'

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    # TESTING
    # ================
    # client-side:
    # ----------------
    karma:
      unit:
        configFile: 'karma.conf.js'
        autoWatch: false
        background: true
      travis:
        configFile: 'karma.conf.js'
        autoWatch: false
        singleRun: true
        browsers: ['sl_chrome_OSX9']

    # server-side:
    # ----------------
    # name matters for the 'mocha-chai-sinon' module
    'mocha-chai-sinon':
      build:
        src: ['./tests/server/**/*.js']
        options:
          ui: 'bdd'
          reporter: 'spec'
      coverage:
        src: ['./tests/server/**/*.js']
        options:
          ui: 'bdd'
          reporter: 'html-cov'
          quiet: true
          # filter: '/foo/foo1/' # which files are you testing for coverage?
          captureFile: './coverage/MCS_server_coverage.html'


    # INITIALIZING & PROD-READY
    # ==========================
    open:
      client:
        path: 'http://localhost:1337'

    clean:
      build: 'build/'

    copy:
      client:
        expand: true
        cwd: 'client/'
        src: ['**', '!**/styl/**', '!**/classes/**']
        dest: 'build/client/'

    uglify:
      options:
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today(\'yyyy-mm-dd\') %>\n' + '* <%= pkg.homepage %>/\n' + '* Copyright (c) <%= grunt.template.today(\'yyyy\') %> <%= pkg.author %>; Licensed <%= pkg.license %> */\n'
        mangle:
          except: ['_super']
      client:
        files:
          'build/client/game/s.js': [includeOrder]

    concat:
      client:
        src: [includeOrder]
        dest: 'build/client/game/s.js'

    # LINTING & COMPILE
    # =================

    jshint:
      options:
        jshintrc: '.jshintrc'
      gruntfile: ['Gruntfile.js']
      server: ['app.js']
      client: ['client/**/*.js', '!**/models/**', '!**/lib/**']
      tests: ['tests/**/*.js', '!tests/oculus-testing-playground/**/*.js']

    stylus:
      compile:
        options:
          # nib
          paths: ['node_modules/', 'client/game/styl/'] # Individual components

        files:
          'build/client/game/s.css': 'client/game/styl/s.styl'

    # WATCH
    # =================

    watch:
      gruntfile:
        files: ['Gruntfile.js']
        tasks: ['jshint:gruntfile']
        options:
          livereload: true
      server:
        files: ['app.js']
        tasks: ['server']
        options:
          livereload: true
      client:
        files: ['client/**']
        tasks: ['client']
        options:
          livereload: true
      test:
        files: [ 'client/**', 'tests/**/*.js' ]
        tasks: [ 'mocha-chai-sinon', 'karma:unit:run' ]

    # RUN CONCURRENTS
    # =================

    concurrent:
      target:
        tasks: ['nodemon', 'watch', 'delayed-open'],
        options:
          logConcurrentOutput: true

    # INIT SERVER
    # =================

    nodemon:
      dev: {}

    grunt.registerTask 'delayed-open', 'open the local host after the server has spun up.', ->
      setInterval grunt.task.run('open'), 3000

  # DEPENDENCIES
  # =================
  # Loading dependencies
  # for pkg of grunt.file.readJSON("package.json").devDependencies
  #   grunt.loadNpmTasks pkg  if pkg isnt "grunt" and pkg.indexOf("grunt") is 0

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.loadNpmTasks 'grunt-concurrent'
  grunt.loadNpmTasks 'grunt-nodemon'
  grunt.loadNpmTasks 'grunt-open'

  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-mocha-chai-sinon'
  grunt.loadNpmTasks 'grunt-saucelabs'

  # REGISTER
  # =================

  grunt.registerTask 'travisCI', ['jshint:server',
                                  'jshint:client',
                                  'jshint:tests',
                                  'karma:travis',
                                  'mocha-chai-sinon']
  grunt.registerTask 'test', ['karma:unit:start', 'watch:test']
  grunt.registerTask 'server', ['jshint:server']
  grunt.registerTask 'client', ['jshint:client', 'copy:client', 'concat', 'stylus']
  grunt.registerTask 'client-prod', ['client', 'uglify']
  grunt.registerTask 'default', ['server', 'client', 'karma:unit:start', 'concurrent']

