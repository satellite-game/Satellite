s.Ship = new Class({
	extend: s.GameObject,

	construct: function(options) {

		var geometry = s.models[options.shipClass].geometry;
		var materials = s.models[options.shipClass].materials;

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 100);
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		this.lastTime = 0;
        this.alliance = options.alliance;

        this.game = options.game;
        this.name = options.name || '';
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
		var now =new Date().getTime();

        // Turrets
        if(weapon === 'turret'){
            if( now - this.lastTime > 300){

                new s.Turret({
                    game: this.game,
                    position: this.getEulerRotation(new THREE.Vector3(25, 0, -120)),
                    rotation: this.root.rotation.clone(),
                    initialVelocity: this.root.getLinearVelocity().clone(),
                    team: this.alliance
                });
                this.trigger('fire', {
                    pos: [bulletPosition.x, bulletPosition.y, bulletPosition.z],
                    rot: [bulletRotation.x, bulletRotation.y, bulletRotation.z],
                    type: type
                });
                new s.Turret({
                    game: this.game,
                    position: this.getEulerRotation(new THREE.Vector3(-25, 0, -120)),
                    rotation: this.root.rotation.clone(),
                    initialVelocity: this.root.getLinearVelocity().clone(),
                    team: this.alliance
                });
                this.lastTime = now;
            }
        }

        // Missiles
        if(weapon === 'missile'){
            if( now - this.lastTime > 300){

                new s.Missile({
                    game: this.game,
                    position: this.getEulerRotation(new THREE.Vector3(0, 0, -120)),
                    rotation: this.root.rotation.clone(),
                    initialVelocity: this.root.getLinearVelocity().clone(),
                    team: this.alliance
                });
                this.lastTime = now;
            }
        }
    },

    setPosition: function (position, rotation, aVeloc, lVeloc, interpolate) {
        var posInterpolation = 0.05;
        var rotInerpolation = 0.50;

        if (interpolate) {
            // Interpolate position by adding the difference of the calulcated position and the position sent by the authoritative client
            var newPositionVec = new THREE.Vector3(position[0], position[1], position[2]);
            var posErrorVec = newPositionVec.sub(this.root.position).multiply(new THREE.Vector3(posInterpolation, posInterpolation, posInterpolation));
            this.root.position.add(posErrorVec);
        }
        else {
            // Directly set position
            this.root.position.set(position[0], position[1], position[2]);
        }

        // Set rotation
        if (rotation)
            this.root.rotation.set(rotation[0], rotation[1], rotation[2]);

        if (aVeloc !== undefined && this.root.setAngularVelocity)
            this.root.setAngularVelocity({ x: aVeloc[0], y: aVeloc[1], z: aVeloc[2] });

        if (lVeloc !== undefined && this.root.setLinearVelocity)
            this.root.setLinearVelocity({ x: lVeloc[0], y: lVeloc[1], z: lVeloc[2] });

        // Tell the physics engine to update our position
        this.root.__dirtyPosition = true;
        this.root.__dirtyRotation = true;
    },


    getPositionPacket: function() {
        var root = this.getRoot();

        // Position & rotation
        var shipPosition = (root && root.position) || new THREE.Vector3();
        var shipRotation = (root && root.rotation) || new THREE.Vector3();

        // Velocity
        var linearVelocity = (root.getLinearVelocity && root.getLinearVelocity()) || new THREE.Vector3();
        var angularVelocity = (root.getAngularVelocity && root.getAngularVelocity()) || new THREE.Vector3();

        return {
            pos: [shipPosition.x, shipPosition.y, shipPosition.z],
            rot: [shipRotation.x, shipRotation.y, shipRotation.z],
            aVeloc: [angularVelocity.x, angularVelocity.y, angularVelocity.z],
            lVeloc: [linearVelocity.x, linearVelocity.y, linearVelocity.z]
        };
    }
});
