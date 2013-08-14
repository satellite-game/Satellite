s.SatelliteGame = new Class({
	toString: 'SatelliteGame',
	extend: s.Game,

	initialize: function(_super) {
		_super.call(this);
		
		// No gravity
		this.scene.setGravity(new THREE.Vector3(0, 0, 0));

		// Ambient light
		// this.ambientLight = new THREE.AmbientLight(0x222222);
		this.ambientLight = new THREE.AmbientLight(0xAAAAAA);
		this.scene.add(this.ambientLight);
	
		// Directional light
		this.light = new THREE.DirectionalLight(0xFFFFFF, 2);
		this.light.position.set(2200, 2200, -4000);
		this.scene.add(this.light);
		
		// Setup camera
		this.camera.position.set(0,0,1000);
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		// Add moon
		this.moon = new s.Moon({
			game: this
		});

		// Add a ship
		this.ship = new s.Ship({
			game: this,
			shipClass: 'human_ship_heavy',
			position: new THREE.Vector3(-300, 100, 0),
			rotation: new THREE.Vector3(0, Math.PI, 0)
		});

		// Add another ship
		this.ship2 = new s.Ship({
			game: this,
			shipClass: 'human_ship_light',
			position: new THREE.Vector3(300, 100, 0),
			rotation: new THREE.Vector3(0, 0, 0)
		});


		this.addStars();

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

	addStars: function() {
		var radius = 5000;

		var starSprite = THREE.ImageUtils.loadTexture('game/textures/particle.png');
		var geometry = new THREE.Geometry();

		// Set to false for "dust", true for stars
		var outer = false;

		for (var i = 0; i < 5000; i ++ ) {

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
				vertex.x = Math.random() * 2000 - 1000;
				vertex.y = Math.random() * 2000 - 1000;
				vertex.z = Math.random() * 2000 - 1000;
			}

			geometry.vertices.push( vertex );

		}

		var material = new THREE.ParticleBasicMaterial({
			size: 5,
			map: starSprite,
			blending: THREE.AdditiveBlending,
			depthTest: true,
			transparent: true
		});

		var particles = new THREE.ParticleSystem(geometry, material);

		this.scene.add(particles);
	}
});
