s.Game = new Class({
	extend: EventEmitter,
	
	construct: function(options) {
		var self = this;
		
		this.options = jQuery.extend({}, this.defaults, options);
		
		this._doRender = false;
		this._lastRender = 0;
		
		// Store functions hooked to render
		this._hookedFuncs = [];
		
		// Store laoded models
		this.models = {};
		
		// Bind callback functions
		this.bind(this.animate);
		this.bind(this.fitWindow);
		this.bind(this.handleFullscreenChange);
		this.bind(this.handlePointerLockChange);
		this.bind(this.handlePointerLockError);
		
		// Configure Physijs
		Physijs.scripts.worker = 'lib/physijs_worker.js';
		Physijs.scripts.ammo = '../ammo.js';
		
		/******************
		Create utility instances
		******************/
		// Projector
		this.projector = new THREE.Projector();
		
		// Model loader
		this.loader = new THREE.JSONLoader();
		
		// Gamepad interface
		/*
		this.gamepad = new Gamepad();
		
		this.gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
			console.log('Gamepad connected: '+device.id);
		});

		this.gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
			console.log('Gamepad disconnected: '+device.id);
		});

		this.gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
			console.warn('Unsupported gamepad connected: '+device.id);
		});
		
		if (!this.gamepad.init()) {
			console.warn('Gamepads are not supported on this browser');
		}
		*/
		
		/******************
		Create rendering instances
		******************/
		// Create renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias: true // to get smoother output
		});
		
		// Set sky color
		this.renderer.setClearColorHex(0x87CCEB);
		
		// Create a camera
		this.camera = new THREE.PerspectiveCamera(35, 1, 1, 10000);
		
		// Configure shadow
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;
		this.renderer.shadowMapCullFrontFaces = false;

		// Create the scene
		this.scene = scene = new Physijs.Scene();
		this.scene.add(this.camera);

		// Add listeners
		$(window).on('resize', this.fitWindow);
		
		/******************
		Initialization
		******************/
		// Add the renderer's canvas to the DOM
		this.el = this.renderer.domElement;
		$(document.body).append(this.el);
		
		// TODO: abstract key listening
		$(document).on('keydown', function(evt) {
			if (evt.which === 13)
				self.toggleFullScreen();
		});
		
		$(document).on('fullscreenchange mozfullscreenchange webkitfullscreenchange', this.handleFullscreenChange);
 
		$(document).on('pointerlockchange mozpointerlockchange webkitpointerlockchange', this.handlePointerLockChange);
		$(document).on('pointerlockerror mozpointerlockerror webkitpointerlockerror', this.handlePointerLockError);
 
		this.fitWindow();
		
		this.handleFullscreenChange();
		
		this.render_stats = new Stats();
		this.render_stats.domElement.style.position = 'absolute';
		this.render_stats.domElement.style.top = '0px';
		this.render_stats.domElement.style.zIndex = 100;
		document.body.appendChild(this.render_stats.domElement);

		this.physics_stats = physics_stats = new Stats();
		this.physics_stats.domElement.style.position = 'absolute';
		this.physics_stats.domElement.style.top = '50px';
		this.physics_stats.domElement.style.zIndex = 100;
		document.body.appendChild(this.physics_stats.domElement);
		
		// Physics engine statistics
		this.scene.addEventListener(
			'update',
			function() {
				physics_stats.update();
			}
		);
		
		// Physics engine ready state
		// TODO: This doesn't really do much, find a better way to figure out if the engine has started. 2+ ticks?
		this.physicsStarted = false;
		this.scene.addEventListener(
			'ready', 
			function() {
				self.physicsStarted = true;
				self.tryInitialize();
			}
		);
		
		this.loadModels();
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


	fitWindow: function() {
		// Size the rendere to match the window size
		this.setSize(window.innerWidth, window.innerHeight);
	},
	
	// Display
	setSize: function(width, height) {
		this.options.width = width;
		this.options.height = height;
		this.renderer.setSize(width, height);
		if (this.camera) {
			this.camera.aspect = width/height;
			this.camera.updateProjectionMatrix();
		}
	},
	
	// Loop
	hook: function(callback) {
		this._hookedFuncs.push(callback);
	},
	
	unhook: function(callback) {
		var index = this._hookedFuncs.indexOf(callback);
		if (~index)
			this._hookedFuncs.splice(index, 1);
	},
	
	// Rendering
	stop: function() {
		this._doRender = false;
	},
	
	start: function() {
		this._doRender = true;
		requestAnimationFrame(this.animate);
	},
	
	animate: function(time) {
		if (this._doRender) {
			requestAnimationFrame(this.animate);
			this.render(time);
		}
	},

	render: function(time) {
		var now = time/1000;
		
		this.scene.simulate();
	
		if (!this._lastRender)
			this._lastRender = now - 1/60;
		
		var delta = now - this._lastRender;
		
		this._lastRender = now;
		
		this._hookedFuncs.forEach(function(func) {
			func(delta, now);
		});
		
		// Re-render the scene
		this.renderer.render(this.scene, this.camera);
		
		this.render_stats.update();
	},
	
	// Utilities
	createRay: function(pointA, pointB) {
		var rayStart = pointA;
		var rayDirection = new THREE.Vector3();
		rayDirection.subVectors(pointB, pointA).normalize();
		
		return new THREE.Raycaster(rayStart, rayDirection);
	},
	
	getNDCX: function(x) {
		return (x / this.options.width) * 2 - 1;
	},
	
	getNDCY: function(y) {
		return -(y / this.options.height) * 2 + 1;
	},
	
	get2DCoords: function(objVector, removeYOffset) {
		var vector3D = objVector.clone();
		
		// Objects are positioned with a Y offset of height/2, remove this 
		if (removeYOffset)
			vector3D.y = 0;
			
		var vector2D = this.projector.projectVector(vector3D, this.camera);
		
		vector2D.y = -(vector2D.y*this.options.height - this.options.height)/2;
		vector2D.x = (vector2D.x*this.options.width + this.options.width)/2;
		
		return vector2D;
	},
	
	get3DCoords: function(x, y) {
		// Convert to normalized device coordinates
		var xVal = this.getNDCX(x);
		var yVal = this.getNDCY(y);
		
		var startVector = new THREE.Vector3();
		var endVector = new THREE.Vector3();
		var dirVector = new THREE.Vector3();
		var goalVector = new THREE.Vector3();
		var t;
		
		// Create vectors above and below ground plane at our NDCs
		startVector.set(xVal, yVal, -1.0);
		endVector.set(xVal, yVal, 1.0);
		
		// Convert back to 3D world coordinates
		startVector = this.projector.unprojectVector(startVector, this.camera);
		endVector = this.projector.unprojectVector(endVector, this.camera);
		
		// Get direction from startVector to endVector
		dirVector.subVectors(endVector, startVector);
		dirVector.normalize();
		
		// Find intersection where y = 0
		t = startVector.y / -(dirVector.y);

		// Find goal point
		goalVector.set(
			startVector.x + t * dirVector.x,
			startVector.y + t * dirVector.y,
			startVector.z + t * dirVector.z
		);
		
		return goalVector;
	},
	
	tryInitialize: function() {
		if (this.modelsLoaded && this.physicsStarted && !this.initialized) {
			console.log('Physics engine started!');
			if (typeof this.initialize === 'function')
				this.initialize();
		}
	},
	
	loadModels: function() {
		var toLoad = this.options.models.length;
		if (!toLoad) {
			this.tryInitialize();
			return;
		}
		
		// Hold models
		var models = this.models;
		
		var self = this;
		var loaded = function(name, geometry, materials) {
			// Store model and materials
			models[name] = {
				geometry: geometry,
				materials: materials
			};
			
			// Track progress
			toLoad--;
			if (toLoad === 0) {
				console.log('Models loaded!');
				self.trigger('models:loaded');
				self.modelsLoaded = true;
			}
			else {
				var pct = (self.options.models.length-toLoad)/self.options.models.length*100;
				console.log('Loading: '+pct.toFixed(0)+'%');
				self.trigger('models:loading', pct);
			}
		};
		
		this.options.models.forEach(function(name, index) {
			self.loader.load('duneBuggy/models/'+name+'.js', loaded.bind(self, name));
		});
	}
});
