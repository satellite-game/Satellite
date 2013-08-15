s.SatelliteGame = new Class({
	toString: 'SatelliteGame',
	extend: s.Game,
	
	// Models that should be loaded
	models: [
		'phobos_large_hifi',
		'human_ship_heavy',
		'human_ship_light'
	],

	initialize: function(_super) {
		_super.call(this);
		
		// No gravity
		this.scene.setGravity(new THREE.Vector3(0, 0, 0));

		// Ambient light
		// this.ambientLight = new THREE.AmbientLight(0x222222);
		this.ambientLight = new THREE.AmbientLight(0x555555);
		this.scene.add(this.ambientLight);
	
		// Directional light
		this.light = new THREE.DirectionalLight(0xFFFFFF, 2);
		this.light.position.set(-100000, 0, 0);
		this.scene.add(this.light);
		
		// Add moon
		this.moon = new s.Moon({
			game: this
		});

		// Add a ship
		this.ship = new s.Ship({
			game: this,
			shipClass: 'human_ship_light',
			position: new THREE.Vector3(10000, 2000, 10000),
			rotation: new THREE.Vector3(0, Math.PI/4, 0)
		});

		// Setup camera
		this.ship.root.add(this.camera);
		this.camera.position.set(0,75,350);


		this.addSkybox();

		// Add dust
		this.addDust();

		// Temporary trackball controls
		this.controls = new THREE.TrackballControls(this.camera);

		this.controls.rotateSpeed = 1.0;
		this.controls.zoomSpeed = 0.25;
		this.controls.panSpeed = 0.8;

		this.controls.noZoom = false;
		this.controls.noPan = false;

		this.controls.staticMoving = true;
		this.controls.dynamicDampingFactor = 0.3;

		this.controls.keys = [ 65, 83, 68 ];
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

		this.skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(100000, 100000, 100000, 1, 1, 1, null, true ), material);
		this.scene.add(this.skyboxMesh);
	},

	addDust: function() {
		var starSprite = THREE.ImageUtils.loadTexture('game/textures/particle.png');
		var geometry = new THREE.Geometry();

		// Set to false for "dust", true for stars
		var outer = false;

		// Spec size
		var radius = 100000;
		var size = 100;
		var count = 5000;

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
