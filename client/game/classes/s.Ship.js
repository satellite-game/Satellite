s.Ship = new Class({
	extend: s.GameObject,

    options: {
        leftTurretOffset: new THREE.Vector3(25, 0, -120),
        rightTurretOffset: new THREE.Vector3(-25, 0, -120),
        missileOffset: new THREE.Vector3(0, 0, -120),
        turretFireTime: 300,
        missileFireTime: 1000
    },

	construct: function(options) {
		var geometry = s.models[options.shipClass].geometry;
		var materials = s.models[options.shipClass].materials;

        var physiMaterial = Physijs.createMaterial(new THREE.MeshFaceMaterial(materials));
		this.root = new Physijs.ConvexMesh(geometry, physiMaterial, 100);
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

        this.lastTurretFire = 0;
        this.lastMissileFire = 0;
        this.alliance = options.alliance;

        this.game = options.game;
        this.name = options.name || '';

        this.root.name = this.name;
        this.hull = s.config.ship.hull;
        this.health = 100;
	},

    getOffset: function(offset) {
        return offset.clone().applyMatrix4(this.root.matrixWorld);
    },

	fire: function(weapon){
		var now =new Date().getTime();
        var position;
        var rotation = this.root.rotation.clone();
        var initialVelocity = this.root.getLinearVelocity().clone();

        // Turrets
        if (weapon === 'turret'){
            if (now - this.lastTurretFire > this.options.turretFireTime){
                console.log(this.getForceVector());

                // Left bullet
                position = this.getOffset(this.options.leftTurretOffset);
                new s.Turret({
                    game: this.game,
                    pilot: this.game.pilot.name,
                    position: position,
                    rotation: rotation,
                    initialVelocity: initialVelocity,
                    team: this.alliance
                });
                this.game.handleFire({
                    position: position,
                    rotation: rotation,
                    initialVelocity: initialVelocity
                });

                // Right bullet
                position = this.getOffset(this.options.rightTurretOffset);
                new s.Turret({
                    game: this.game,
                    pilot: this.game.pilot.name,
                    position: position,
                    rotation: rotation,
                    initialVelocity: initialVelocity,
                    team: this.alliance
                });
                this.game.handleFire({
                    position: position,
                    rotation: rotation,
                    initialVelocity: initialVelocity
                });

                this.lastTurretFire = now;
            }
        }

        // Missiles
        if (weapon === 'missile'){
            if(now - this.lastMissileFire > this.options.missileFireTime){
                position = this.getOffset(this.options.missileOffset);

                new s.Missile({
                    game: this.game,
                    position: position,
                    rotation: rotation,
                    initialVelocity: initialVelocity,
                    team: this.alliance
                });

                this.lastMissileFire = now;
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
    },

    getForceVector: function(){

        // Extract the rotation from the projectile's matrix
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.extractRotation(this.root.matrix);

        // Apply bullet impulse in the correct direction
        return new THREE.Vector3(0, 0, 1500 * -1).applyMatrix4(rotationMatrix);
    },

    handleDie: function(){
        this.destruct();
    }
});
