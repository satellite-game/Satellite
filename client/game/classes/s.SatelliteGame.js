s.SatelliteGame = new Class({
	toString: 'SatelliteGame',
	extend: s.Game,

	// Models that should be loaded
	models: [
		'phobos_hifi',
		'human_ship_heavy',
		'human_ship_light'
	],

	initialize: function(_super) {
		var that = this;
		_super.call(this);
		
		/*===============================================
		=             Comms Handler Binding            =
		===================================================*/
		

		/*========== Start of Comms Handlers  ==========*/
		
		// Bind functions
		this.bind(this.handleFire);
		this.bind(this.handleJoin);
		this.bind(this.handleLeave);
		this.bind(this.handleMove);
		this.bind(this.handleEnemyFire);
		this.bind(this.handleHit);
		this.bind(this.handlePlayerList);
		this.bind(this.handleKill);

		/*==========  End of Comms Handler Binding   ==========*/


		// Communication
		this.comm = new db.Comm({
			player: this.player,
			ship: this.ship,
			server: window.location.hostname + ':1935'
		});
		
        this.comm.on('fire', this.handleEnemyFire);
        this.comm.on('hit', this.handleHit);
        this.comm.on('player list', this.handlePlayerList);
        this.comm.on('killed', this.handleKill);
        this.comm.on('join', this.handleJoin);
        this.comm.on('leave', this.handleLeave);
        this.comm.on('move', this.handleMove);
		
		/*-----  End of  Comms Handler Binding  ------*/

		// No gravity
		this.scene.setGravity(new THREE.Vector3(0, 0, 0));

		// Ambient light
		this.ambientLight = new THREE.AmbientLight(0x382828);
		this.scene.add(this.ambientLight);

		// Directional light
		this.light = new THREE.DirectionalLight(0xEEEEEE, 2);
		this.light.position.set(-100000, 0, 0);
		this.scene.add(this.light);

		// Add moon
		this.moon = new s.Moon({
			game: this
		});

		// Add a ship
		this.player = new s.Player({
			game: this,
			shipClass: 'human_ship_light',
			position: new THREE.Vector3(10000, 2000, 10000),
			rotation: new THREE.Vector3(0, Math.PI/4, 0)
		});

		// Root camera to the player's position
		this.player.root.add(this.camera);

        //// Setup camera: Cockpit view; COMMENT OUT FOR CHASE CAM
		this.camera.position.set(0,0,23);
        //// Setup camera: Chase view
        //this.camera.position.set(0,35,350);

		// Planet camera
		// this.scene.add(this.camera);
		// this.camera.position.set(10000,2000,10000);

		// Add skybox
		this.addSkybox();

		// lazd: Dust is kinda lame. But I want some sort of thing that shows you're moving
		this.addDust();

		this.HUD = new s.HUD({
			game: this
		});

        // Fly controls
        this.controls = new s.Controls({
            game: this,
            player: this.player,
            camera: this.camera,
            HUD: this.HUD
        });

        // Dependent on controls; needs to be below s.Controls
        this.radar = new s.Radar({
            game: this,
            controls: this.controls
        });

		window.addEventListener('mousemove', function(e){
			that.HUD.targetX = e.pageX;
			that.HUD.targetY = e.pageY;
		});
		window.addEventListener('mousedown',function(){
			that.controls.firing = true;
		});
		window.addEventListener('mouseup',function(){
			that.controls.firing = false;
		});


		this.HUD.controls = this.controls;

	},

	render: function(_super, time) {
		_super.call(this, time);
		this.controls.update();
	},

	addSkybox: function() {
		var urlPrefix = "game/textures/skybox/Purple_Nebula_";
		var urls = [
			urlPrefix + "right1.png", urlPrefix + "left2.png",
			urlPrefix + "top3.png", urlPrefix + "bottom4.png",
			urlPrefix + "front5.png", urlPrefix + "back6.png"
		];

		var textureCube = THREE.ImageUtils.loadTextureCube(urls);
		textureCube.format = THREE.RGBFormat;
		var shader = THREE.ShaderLib.cube;

		var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
		uniforms.tCube.value = textureCube;

		var material = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: uniforms,
			side: THREE.BackSide
		});

		this.skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(200000, 200000, 200000, 1, 1, 1, null, true ), material);
		this.scene.add(this.skyboxMesh);
	},

	addDust: function() {
		var starSprite = THREE.ImageUtils.loadTexture('game/textures/particle.png');
		var geometry = new THREE.Geometry();

		// Set to false for "dust", true for stars
		var outer = true;

		// Spec size
		var radius = 100000;
		var size = 100;
		var count = 1000;

		for (var i = 0; i < count; i ++ ) {

			var vertex = new THREE.Vector3();

			if (outer) {
				// Distribute "stars" on the outer bounds of far space
				vertex.x = Math.random() * 2 - 1;
				vertex.y = Math.random() * 2 - 1;
				vertex.z = Math.random() * 2 - 1;
				vertex.multiplyScalar(radius);
			}
			else {
				// Distribute "dust" throughout near space
				vertex.x = Math.random() * radius - radius/2;
				vertex.y = Math.random() * radius - radius/2;
				vertex.z = Math.random() * radius - radius/2;
			}

			geometry.vertices.push( vertex );

		}

		var material = new THREE.ParticleBasicMaterial({
			size: size,
			map: starSprite,
			blending: THREE.AdditiveBlending,
			depthTest: true,
			transparent: true
		});

		var particles = new THREE.ParticleSystem(geometry, material);

		this.scene.add(particles);
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
		
		new db.Explosion({
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
			bulletModel = new db.Missile({
				game: this,
				position: bulletPosition,
				rotation: bulletRotation,
				alliance: 'enemy'
			});
		}
		else {
			bulletModel = new db.Bullet({
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
		new db.Explosion({
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
