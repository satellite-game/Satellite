s.Ship = new Class({
	extend: s.GameObject,

	construct: function(options) {

		// handle parameters
		this.options = options = jQuery.extend({
			position: new THREE.Vector3(0, 0, 0),
			rotation: new THREE.Vector3(0, 0, 0)
		}, options);

		var geometry = s.models[options.shipClass].geometry;
		var materials = s.models[options.shipClass].materials;

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 100);
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		this.lastTime = 0;
        this.team = 'alliance';
	},

    // Calculate the position of the bullet
	getEulerRotation: function(bulletOffset) {

		// Update the matrix
		this.root.updateMatrix();

		// Extract just the rotation from the matrix
		var rotation_matrix = new THREE.Matrix4();
		rotation_matrix.extractRotation(this.root.matrix);

		// Convert the rotation to euler coordinates with the proper order
		var rotation = new THREE.Vector3();
		rotation.setEulerFromRotationMatrix(rotation_matrix, 'XYZ');

		this.root.eulerRotation = rotation;

		// Store position of bullet relative to the world
		return bulletOffset.clone().applyMatrix4(this.root.matrixWorld);
	},

	fire: function(weapon){
        // Throttle the number of turrets fired per second
		var now =new Date().getTime();

        // Turrets
        if(weapon === 'turret'){
            if( now - this.lastTime > 300){

                // Right turret
                new s.Turret({
                    game: this.options.game,
                    position: this.getEulerRotation(new THREE.Vector3(25, 0, -120)),
                    rotation: this.root.rotation.clone(),
                    initialVelocity: this.root.getLinearVelocity().clone(),
                    team: this.team
                });

                // Left turret
                new s.Turret({
                    game: this.options.game,
                    position: this.getEulerRotation(new THREE.Vector3(-25, 0, -120)),
                    rotation: this.root.rotation.clone(),
                    initialVelocity: this.root.getLinearVelocity().clone(),
                    team: this.team
                });
                this.lastTime = now;
            }
        }

        // Missiles
        if(weapon === 'missile'){
            if( now - this.lastTime > 300){

                new s.Missile({
                    game: this.options.game,
                    position: this.getEulerRotation(new THREE.Vector3(0, 0, -120)),
                    rotation: this.root.rotation.clone(),
                    initialVelocity: this.root.getLinearVelocity().clone(),
                    team: this.team
                });
                this.lastTime = now;
            }
        }
	}
});
