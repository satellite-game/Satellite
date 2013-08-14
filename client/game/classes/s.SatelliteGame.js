s.SatelliteGame = new Class({
	toString: 'SatelliteGame',
	extend: s.Game,

	initialize: function(_super) {
		_super.call(this);
		
		// No gravity
		this.scene.setGravity(new THREE.Vector3(0, 0, 0));

		// Ambient light
		this.ambientLight = new THREE.AmbientLight(0x666666);
		this.scene.add(this.ambientLight);
	
		// Directional light
		this.light = new THREE.DirectionalLight(0xFFFFFF, 2);
		this.light.position.set(2200, 2200, -4000);
		this.scene.add(this.light);
		
		// Setup camera
		this.camera.position.set(0,500,500);
		this.camera.lookAt(new THREE.Vector3(0,0,0));

		// Add moon
		this.moon = new s.Moon({
			game: this
		});

		// Add a ship
		this.ship = new s.Ship({
			game: this,
			shipClass: 'human_ship_heavy',
			position: new THREE.Vector3(-50, 300, 0),
			rotation: new THREE.Vector3(0, 0, Math.PI/2)
		});

		// Add another ship
		this.ship2 = new s.Ship({
			game: this,
			shipClass: 'human_ship_light',
			position: new THREE.Vector3(50, 300, 0),
			rotation: new THREE.Vector3(0, 0, Math.PI/2)
		});
	}
});
