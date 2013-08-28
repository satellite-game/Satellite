module.exports = (grunt) ->

  # Order of concatonation/minification
  includeOrder = [
    "client/game/s.js"
    "client/game/s.util.js"
    "client/game/classes/s.EventEmitter.js"
    "client/game/classes/s.GameObject.js"
    "client/game/classes/s.Shield.js"
    "client/game/classes/s.Sound.js"
    "client/game/classes/s.Explosion.js"
    "client/game/classes/s.Projectile.js"
    "client/game/classes/s.Turret.js"
    "client/game/classes/s.Missile.js"
    "client/game/classes/s.Ship.js"
    "client/game/classes/s.Player.js"
    "client/game/classes/s.Moon.js"
    "client/game/classes/s.Keyboard.js"
    "client/game/classes/s.Controls.js"
    "client/game/classes/s.Hud.js"
    "client/game/classes/s.Radar.js"
    "client/game/classes/s.Comm.js"
    "client/game/classes/s.Game.js"
    "client/game/classes/s.SatelliteGame.js"
    ]

  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")

    open:
      client:
        path: "http://localhost:1337"

    watch:
      gruntfile:
        files: ["Gruntfile.js"]
        tasks: ["jshint:gruntfile"]
        options:
          livereload: true
      server:
        files: ["app.js"]
        tasks: ["server"]
        options:
          livereload: true
      client:
        files: ["client/**"]
        tasks: ["client"]
        options:
          livereload: true

    clean:
      build: "build/"

    copy:
      client:
        expand: true
        cwd: "client/"
        src: ["**", "!**/styl/**", "!**/classes/**"]
        dest: "build/client/"

    uglify:
      options:
        banner: "/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today(\"yyyy-mm-dd\") %>\n" + "* <%= pkg.homepage %>/\n" + "* Copyright (c) <%= grunt.template.today(\"yyyy\") %> <%= pkg.author %>; Licensed <%= pkg.license %> */\n"
        mangle:
          except: ["_super"]
      client:
        files:
          "build/client/game/s.js": [includeOrder]

    concat:
      client:
        src: [includeOrder]
        dest: "build/client/game/s.js"

    jshint:
      options:
        jshintrc: ".jshintrc"

      gruntfile: ["Gruntfile.js"]
      server: ["app.js"]
      client: ["client/**/*.js", "!**/models/**", "!**/lib/**"]

    stylus:
      compile:
        options:
          # nib
          paths: ["node_modules/", "client/game/styl/"] # Individual components

        files:
          "build/client/game/s.css": "client/game/styl/s.styl"

    concurrent:
      target:
        tasks: ['nodemon', 'watch', "delayed-open"],
        options:
          logConcurrentOutput: true

    nodemon: {
      dev: {}
    }

    grunt.registerTask "delayed-open", "open the local host after the server has spun up.", ->
      setInterval grunt.task.run("open"), 3000

  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-contrib-stylus"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.loadNpmTasks "grunt-open"
  grunt.loadNpmTasks "grunt-nodemon"
  grunt.loadNpmTasks "grunt-concurrent"

  grunt.registerTask "server", ["jshint:server"]
  grunt.registerTask "client", ["jshint:client", "copy:client", "concat", "stylus"]
  grunt.registerTask "client-prod", ["client", "uglify"]
  grunt.registerTask "default", ["server", "client","concurrent"]
