s.Game = new Class({
	extend: s.EventEmitter,
	
	construct: function(options) {
		var self = this;
		
		this.doRender = false;
		this.lastRender = 0;
		
		// Store functions that should be called before render
		this.hookedFuncs = [];
		
		// Bind render function permenantly
		this.render = this.render.bind(this);
		
		// Configure Physijs
		Physijs.scripts.worker = 'lib/physijs_worker.js';
		Physijs.scripts.ammo = 'ammo.js';
		
		// Create renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true // to get smoother output
		});
		
		// Set sky color
		this.renderer.setClearColor(0x87CCEB);
		
		// Create a camera
		this.camera = new THREE.PerspectiveCamera(35, 1, 1, 100000);
		
		// Configure shadows
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;
		this.renderer.shadowMapCullFrontFaces = false;

		// Create the scene
		this.scene = scene = new Physijs.Scene();

		// If we want to attach the camera to an object, doing this first causes a Physijs error
		// this.scene.add(this.camera);

		// Add the renderer's canvas to the DOM
		this.el = this.renderer.domElement;
		$(document.body).append(this.el);
		
		// TODO: abstract key listening
		$(document).on('keydown', function(evt) {
			if (evt.which === 13)
				self.toggleFullScreen();
		});
		
		// Handle window resizes
		$(window).on('resize', this.fitWindow.bind(this));
		this.fitWindow();
		
		// Handle fullscreen state changes		
		$(document).on('fullscreenchange mozfullscreenchange webkitfullscreenchange', this.handleFullscreenChange.bind(this));
		this.handleFullscreenChange();

		// Handle pointer lock changes
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', this.handlePointerLockChange.bind(this));
		$(document).on('pointerlockerror mozpointerlockerror webkitpointerlockerror', this.handlePointerLockError.bind(this));
		
		// Monitor rendering stats
		this.render_stats = new Stats();
		$(this.render_stats.domElement).css({
			position: 'absolute',
			top: 0,
			zIndex: 100
		}).appendTo(document.body);

		this.physics_stats = physics_stats = new Stats();
		$(this.physics_stats.domElement).css({
			position: 'absolute',
			top: '50px',
			zIndex: 100
		}).appendTo(document.body);
		
		// Physics engine statistics
		this.scene.addEventListener(
			'update',
			function() {
				physics_stats.update();
			}
		);
		
		// Physics engine ready state
		// TODO: This event seems to fire before the engine is actually doing anything
		this.physicsStarted = false;
		this.scene.addEventListener(
			'ready', 
			function() {
				self.physicsStarted = true;
				self.tryInitialize();
			}
		);
		
		// Start loading models
		// TODO: Load different conditionally based on game type
		s.util.loadModels({
			models: this.models,
			complete: function(models) {
				self.modelsLoaded = true;

				// Store loaded models
				s.models = models;

				// Attempt to start the game
				self.tryInitialize(this);
			}
		});
	},
	
	// Start the game
	// This method should be overridden
	initialize: function() {
		console.log('Game ready.');

		this.start();
	},

	// Attempt to start the game (if models and physics have begun)
	tryInitialize: function() {
		if (this.modelsLoaded && this.physicsStarted && !this.initialized) {
			this.initialize();
		}
	},

	isFullScreen: function() {
		return (screen.width === window.outerWidth && screen.height === window.outerHeight);
	},

	handleFullscreenChange: function(evt) {
		if (this.isFullScreen()) {
			console.log('Full screen mode entered!');

			this.el.requestPointerLock = this.el.requestPointerLock || this.el.mozRequestPointerLock || this.el.webkitRequestPointerLock;
			this.el.requestPointerLock();
		}
		else {
			console.log('Full screen mode exited!');
		}
	},

	toggleFullScreen: function() {
		if (!this.isFullScreen()) {
			if (document.documentElement.requestFullScreen) {
				document.documentElement.requestFullScreen();
			}
			else if (document.documentElement.mozRequestFullScreen) {
				document.documentElement.mozRequestFullScreen();
			}
			else if (document.documentElement.webkitRequestFullScreen) {
				document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		}
		else {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		}
	},

	handlePointerLockChange: function() {
		if (document.mozPointerLockElement === this.el || document.webkitPointerLockElement === this.el) {
			console.log('Pointer Lock was successful.');
			this.pointerLocked = true;
		}
		else {
			console.log('Pointer Lock was lost.');
			this.pointerLocked = false;
		}
	},

	handlePointerLockError: function() {
		console.log('Error while locking pointer.');
		this.pointerLocked = false;
	},

	// Size the renderer to fit the window
	fitWindow: function() {
		this.setSize(window.innerWidth, window.innerHeight);
	},
	
	// Set the size of the renderer
	setSize: function(width, height) {
		this.width = width;
		this.height = height;
		this.renderer.setSize(width, height);
		if (this.camera) {
			this.camera.aspect = width/height;
			this.camera.updateProjectionMatrix();
		}
	},
	
	// Add a callback to the rendering loop
	hook: function(callback) {
		this.hookedFuncs.push(callback);
	},
	
	// Remove a callback from the rendering loop
	unhook: function(callback) {
		var index = this.hookedFuncs.indexOf(callback);
		if (~index)
			this.hookedFuncs.splice(index, 1);
	},
	
	// Start rendering
	start: function() {
		this.doRender = true;
		requestAnimationFrame(this.render);
	},

	// Stop rendering
	stop: function() {
		this.doRender = false;
	},
	
	// Perform render
	render: function(now) {
		if (this.doRender) {
			// Simulate physics
			this.scene.simulate();
		
			// Calculate the time since the last frame was rendered
			var delta = now - this.lastRender;
			this.lastRender = now;

			// Run each hooked function before rendering
			this.hookedFuncs.forEach(function(func) {
				func(now, delta);
			});
			
			// Re-render the scene
			this.renderer.render(this.scene, this.camera);
			this.render_stats.update();

			// Request the next frame to be rendered
			requestAnimationFrame(this.render);
		}
	}
});
