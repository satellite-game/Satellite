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

		// Setup camera
		this.player.root.add(this.camera);

		///////// COMMENT THIS LINE OUT AND UNCOMMENT CHASE CAM BELOW
        this.camera.position.set(0,0,28);

        // Setup camera: Chase camera
		// this.camera.position.set(0,15,350);

		// Planet camera
		// this.scene.add(this.camera);
		// this.camera.position.set(10000,2000,10000);

		// Add skybox
		this.addSkybox();

		// lazd: Dust is kinda lame. But I want some sort of thing that shows you're moving
		this.addDust();

		// Fly controls
		this.controls = new s.Controls({
			game: this,
			player: this.player,
			camera: this.camera
		});

		this.HUD = new s.HUD({
			game: this,
			controls: this.controls
		});

		window.addEventListener('mousemove', function(e){
			that.HUD.targetX = e.pageX;
			that.HUD.targetY = e.pageY;
		});

        this.radar = new s.Radar({
            game: this,
            player: this.player
        });
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
	}
});
