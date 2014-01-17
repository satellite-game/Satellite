s.Game = new Class({
	extend: s.EventEmitter,

	construct: function(options) {
        // Display load screen
        this.loadScreen = new s.LoadScreen();

		var self = this;

		/*===============================================
		=             Comms Handler Binding            =
		===================================================*/

		// Communication


		// Communication
		this.comm = new s.Comm({
			player: this.player,
			ship: this.ship,
			server: window.location.hostname + ':1935'
		});
		
        this.comm.on('fire', self.handleEnemyFire);
        this.comm.on('hit', self.handleHit);
        this.comm.on('player list', self.handlePlayerList);
        this.comm.on('killed', self.handleKill);
        this.comm.on('join', self.handleJoin);
        this.comm.on('leave', self.handleLeave);
        this.comm.on('move', self.handleMove);
		
		/*-----  End of  Comms Handler Binding  ------*/

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
			antialias: true
		});

		// Enable alpha
		this.renderer.setClearColorHex(0x000000, 0);

		// Create a camera
		this.camera = new THREE.PerspectiveCamera(35, 1, 1, 300000);

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

		s.util.loadTextures({
			textures: this.textures,
			complete: function(textures) {
				self.texturesLoaded = true;

				// Store loaded textures
				s.textures = textures;

				// Attempt to start the game
				self.tryInitialize(this);
			}
		});
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

			this.el.requestPointerLock = this.el.requestPointerLock ||
                                         this.el.mozRequestPointerLock ||
                                         this.el.webkitRequestPointerLock;
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
        this.loadScreen.remove();
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
			// This may need to happen BEFORE physics simulation
			this.hookedFuncs.forEach(function(func) {
				func(now, delta);
			});


            //////////////////////////
            // RADAR RENDER SEGMENT //
            //////////////////////////

            // Radar sphere rotation with respect to player's current rotation
            this.radarScene.children[3].rotation = s.game.player.root.rotation;

            // Clone of the current player's position
            var selfPosition = s.game.player.root.position.clone();

            // Apply negative scaling to position to compensate for moon size
            selfPosition.addScalar(-200);

		}
	},

	/*======================================
	=            Comms Handlers            =
	======================================*/

	handleJoin: function(message) {
		this.enemies.add(message);
	},
	handleLeave: function(message) {
		if (this.enemies.delete(message.name)) {
			console.log('%s has left', message.name);
		}
	},
	handleMove: function(message) {
		if (message.name == this.player.name) {
			// server told us to move
			console.log('Server reset position');
			
			// Return to center
			this.ship.setPosition(message.pos, message.rot, message.tRot, message.aVeloc, message.lVeloc, false); // Never interpolate our own movement
		}
		else {
			// Enemy moved
			if (!this.enemies.do(message.name, 'setPosition', [message.pos, message.rot, message.tRot, message.aVeloc, message.lVeloc, message.interp])) {
				this.enemies.add(message);
			}
		}
	},
	handleKill: function(message) {
		var enemy = this.enemies.get(message.name);
		
		new s.Explosion({
			game: this,
			position: enemy.getPosition().pos
		});
		
		if (message.killer == this.player.name)
			console.warn('You killed %s!', message.name);
		else
			console.log('%s was killed by %s', message.name, message.killer);
	},
	handlePlayerList: function(message) {
		for (var otherPlayerName in message) {
			// don't add self
			if (otherPlayerName == this.player.name) continue;
			
			var otherPlayer = message[otherPlayerName];
			this.enemies.add(otherPlayer);
		}
	},
	handleEnemyFire: function(message) {
		var time = new Date().getTime();
		
		var bulletPosition = new THREE.Vector3(message.pos[0], message.pos[1], message.pos[2]);
		var bulletRotation = new THREE.Vector3(message.rot[0], message.rot[1], message.rot[2]);
		
		var bulletModel;
		if (message.type == 'missile') {
			bulletModel = new s.Missile({
				game: this,
				position: bulletPosition,
				rotation: bulletRotation,
				alliance: 'enemy'
			});
		}
		else {
			bulletModel = new s.Bullet({
				game: this,
				position: bulletPosition,
				rotation: bulletRotation,
				alliance: 'enemy'
			});
		}
		
		// Calculated volume based on distance
		var volume = this.getVolumeAt(bulletPosition);
		
		// Play sound
		var soundInfo = this.options.weapons[message.type].sound;
		this.sound.play(soundInfo.file, soundInfo.volume*volume);
		
		this.enemyBullets.push({
			instance: bulletModel,
			alliance: 'enemy',
			time: time
		});
	},
	handleHit: function(message) {
		// Decrement HP
		this.player.hp -= this.options.weapons[message.type].damage;
		
		this.sound.play('hit_ship_self');
		console.log('You were hit with a %s by %s! Your HP: %d', message.type, message.name, this.player.hp);
		
		if (this.player.hp <= 0) {
			// Player is dead
			this.handleDie(message.name);
		}
	},
	handleFire: function(props) {
		this.comm.fire(props.pos, props.rot, this.currentWeapon);
	},
	handleDie: function(otherPlayerName) {
		new s.Explosion({
			game: this,
			position: this.ship.getRoot().position
		});
		
		this.comm.died(otherPlayerName);
		
		// Restore health
		this.player.hp = 100;
		
		console.warn('You were killed by %s', otherPlayerName);
	}

	/*-----  End of Comms Handlers  ------*/
});
