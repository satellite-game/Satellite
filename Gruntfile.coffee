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
        options:
          configFile: 'karma.conf.js'
          autoWatch: true
          reporters: ['progress', 'coverage']
      watch:
        background: true
        reporters: ['progress']
      single:
        singleRun: true

    # server-side:
    # ----------------
    mochaTest:
      test:
        options:
          reporter: 'spec'
        src: ['tests/server/**/*.js']

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
      unitTests: ['tests/**/*.js']

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
      # unitTests:
      #   files: [ 'test/**/*.js' ]
      #   tasks: [ 'jshint:unitTests', 'karma:watch:run' ]

    # RUN CONCURRENTS
    # =================

    concurrent:
      target:
        tasks: ['nodemon', 'watch', 'delayed-open'],
        # tasks: ['karma', 'watch', 'delayed-open'],
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

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-stylus'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-open'
  grunt.loadNpmTasks 'grunt-nodemon'
  grunt.loadNpmTasks 'grunt-concurrent'
  grunt.loadNpmTasks 'grunt-mocha-test'
  # grunt.loadNpmTasks 'grunt-karma'
  # grunt.loadNpmTasks 'grunt-vows-runner'

  # REGISTER
  # =================

  grunt.registerTask 'server', ['jshint:server']
  grunt.registerTask 'client', ['jshint:client', 'copy:client', 'concat', 'stylus']
  grunt.registerTask 'client-prod', ['client', 'uglify']
  grunt.registerTask 'karma', ['karma:unit:start'] #, 'watch:unitTests']
  grunt.registerTask 'default', ['server', 'client','concurrent']
