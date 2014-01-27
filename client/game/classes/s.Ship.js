s.Ship = new Class({
	extend: s.GameObject,

    options: {
        leftTurretOffset: new THREE.Vector3(35, 0, -200),
        rightTurretOffset: new THREE.Vector3(-35, 0, -200),
        missileOffset: new THREE.Vector3(0, 0, -120),
        turretFireTime: 200,
        botTurretFireTime: 1700,
        missileFireTime: 1000
    },

    initialize: function(options) {
        var geometry = s.models[options.shipClass].geometry;
        this.materials = s.models[options.shipClass].materials[0];
        this.materials.emissive = new THREE.Color('rgb(255,255,255)');

        var physiMaterial = Physijs.createMaterial(this.materials);
        this.root = new Physijs.ConvexMesh(geometry, physiMaterial, 100);
        this.root.position.copy(options.position);
        this.root.rotation.copy(options.rotation);

        this.lastTurretFire = 0;
        this.lastMissileFire = 0;
        this.alliance = options.alliance;

        this.root.name = this.name;
        this.hull = s.config.ship.hull;
        this.shields = s.config.ship.shields;

        this.lastTime = new Date( ).getTime( );
    },

    getOffset: function(offset) {
        return offset.clone().applyMatrix4(this.root.matrixWorld);
    },

	fire: function(weapon){
		var now = new Date().getTime();
        var rotation = this.root.rotation.clone();
        var initialVelocity = this.root.getLinearVelocity().clone();

        var bullet = {
            game: this.game,
            pilot: this.name,
            rotation: rotation,
            initialVelocity: initialVelocity,
            isBot: this.isBot,
            team: this.alliance
        };

        var turretFireTime;
        if (this.isBot) {
            turretFireTime = this.options.botTurretFireTime;
        } else {
            turretFireTime = this.options.turretFireTime;
            bullet.HUD = this.HUD;
        }

        // Turrets
        if (weapon === 'turret'){
            if (now - this.lastTurretFire > turretFireTime){
                // Left bullet
                this.makeTurret(bullet, this.options.leftTurretOffset);

                // Right bullet
                this.makeTurret(bullet, this.options.rightTurretOffset);

                this.lastTurretFire = now;
                if (!this.isBot) { this.game.sound.play('laser', 0.5); }
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

    makeTurret: function(bullet, turretOffset) {
        bullet.position = this.getOffset(turretOffset);
        new s.Turret(bullet);
        if (!this.isBot) {
            this.game.handleFire({
                position: bullet.position,
                rotation: bullet.rotation,
                initialVelocity: bullet.initialVelocity
            });
        }
    },

    setPosition: function (position, rotation, aVeloc, lVeloc, interpolate) {
        var posInterpolation = 0.05;
        var rotInterpolation = 0.50;

        if (interpolate) {
            // Interpolate position by adding the difference of the calculated position and the position sent by the authoritative client
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
