module.exports = function(grunt) {
	// Order of concatonation/minification
	var includeOrder = [
		'client/lib/jquery.js',
		'client/lib/Class.js',
		'client/lib/three.js',
		'client/lib/physi.js',
		'client/lib/Stats.js',
		'client/lib/TrackballControls.js',
		'client/game/s.js',
		'client/game/s.util.js',
		'client/game/classes/s.EventEmitter.js',
		'client/game/classes/s.GameObject.js',
		'client/game/classes/s.Ship.js',
		'client/game/classes/s.Player.js',
		'client/game/classes/s.Moon.js',
		'client/game/classes/s.Keyboard.js',
		'client/game/classes/s.Controls.js',
		'client/game/classes/s.Game.js',
		'client/game/classes/s.SatelliteGame.js'
	];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			build: 'build/'
		},
		copy: {
			client: {
				expand: true,
				cwd: 'client/',
				src: ['**', '!**/styl/**', '!**/classes/**'],
				dest: 'build/client/'
			},
			server: {
				expand: true,
				cwd: 'server/',
				src: ['**'],
				dest: 'build/server/'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'* <%= pkg.homepage %>/\n' +
				'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>; Licensed <%= pkg.license %> */\n',
				mangle: {
					except: ['_super']
				}
			},
			client: {
				files: {
					'build/client/game/s.js': [includeOrder]
				}
			}
		},
		concat: {
			client: {
				src: [includeOrder],
				dest: 'build/client/game/s.js'
			}
		},
		jshint: {
			gruntfile: ['Gruntfile.js'],
			server: ['server/**/*.js'],
			client: ['client/**/*.js', '!**/models/**', '!**/lib/**'],
			options: {
				globals: {
					eqeqeq: true
				}
			}
		},
		stylus: {
			compile: {
				options: {
					'paths': [
						'node_modules/',    // nib
						'client/game/styl/' // Individual components
					]
				},
				files: {
					'build/client/game/s.css': 'client/game/styl/s.styl'
				}
			}
		},
		watch: {	
			gruntfile: {
				files: ['Gruntfile.js'],
				tasks: ['jshint:gruntfile']
			},
			server: {
				files: ['server/**'],
				tasks: ['server']
			},
			client: {
				files: ['client/**'],
				tasks: ['client']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('server', ['jshint:server', 'copy:server']);
	grunt.registerTask('client', ['jshint:client', 'copy:client', 'concat', 'stylus']);
	grunt.registerTask('client-prod', ['client', 'uglify']);
	
	grunt.registerTask('default', ['server', 'client']);
};
