s.Ship = new Class({
	extend: s.GameObject,

    options: {
        leftTurretOffset: new THREE.Vector3(35, 0, -200),
        rightTurretOffset: new THREE.Vector3(-35, 0, -200),
        missileOffset: new THREE.Vector3(0, 0, -120),
        turretFireTime: 200,
        missileFireTime: 1000
    },

    botOptions: {
        rotationSpeed: Math.PI/2,
        pitchSpeed: Math.PI/4,
        yawSpeed: Math.PI/4,
        thrustImpulse: 0,
        brakePower: 0.85,
        velocityFadeFactor: 16,
        rotationFadeFactor: 4
    },

	construct: function(options) {

        this.HUD = options.HUD;
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

        this.game = options.game;
        this.name = options.name || '';

        this.root.name = this.name;
        this.hull = s.config.ship.hull;
        this.shields = s.config.ship.shields;

        if (options.name.slice(0,3) === 'bot') {
            //bot initialization
            this.controlBot = this.controlBot.bind(this);
            this.targetX = 0;
            this.targetY = 0;
            this.subreticleBound = {};//need?

            // array containing trailing predictive targets
            this.trailingPredictions = [];//need?

            // changeTarget modified by key commands to cycle through targets; currentTarget represents index of targeted enemy
            this.changeTarget = 0;//need?
            this.currentTarget = 0;//need?
            
            //Create a camera for the bot
            this.camera = new THREE.PerspectiveCamera(35, 1, 1, 300000);

            // this.BotHUD = new s.BotHUD( {
            //     game: this.game
            // } );

             // Root camera to the bot's position
            this.root.add( this.camera );

            // Setup camera: Cockpit view; COMMENT OUT FOR CHASE CAM
            this.camera.position.set( 0, 0, 0 );

            //set a hook on the bot controls
            if (this.game.lastBotCallback) { this.game.unhook( this.game.lastBotCallback ); }
            this.game.hook( this.controlBot );
            this.game.lastBotCallback = this.controlBot;
        }

        this.lastTime = new Date( ).getTime( );

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
                // Left bullet
                position = this.getOffset(this.options.leftTurretOffset);
                new s.Turret({
                    HUD: this.HUD,
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
                    HUD: this.HUD,
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

                this.game.sound.play('laser', 0.5);
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
    },

    controlBot: function( ) {

        var height = window.innerHeight,
            width = window.innerWidth;

        var vTarget3D;
        var vTarget2D;

        //BC: NEED?
        // this.subreticleBound = {};
        // this.subreticleBound.radius = Math.min(width/8,height/4);

         //////////////////////////////////////////
        // ENEMY TARGETING AND CALLSIGN DISPLAY //
        /////////////////////////////////////////

        var self = this.root;

        // // changeTarget changes current tracked enemy in the enemy array by +/- 1
        // var i = this.currentTarget + this.changeTarget;

        // // cycle i through the list of enemies
        // i = ( i === -1 ? enemiesLen-1 : i > enemiesLen-1 ? 0 : i );
        // this.currentTarget = i;
        // this.changeTarget = 0;

        // this.target = enemies[i];

        this.target = this.game.player;
        var targetInSight = false;

        // for (var j = 0; j < 1; j++) {

        //     this.callTarget = this.game.player.root;

        //     var call3D = this.callTarget.position.clone();
        //     var call2D = s.projector.projectVector(call3D, this.camera);

        //     var distanceToCallTarget, c2D, callSize, callTargetInSight;

        //     //BC: need?
        //     if ( Math.abs(call2D.x) <= 0.95 && Math.abs(call2D.y) <= 0.95 && call2D.z < 1 ){

        //         distanceToCallTarget = self.position.distanceTo(this.callTarget.position);
        //         callSize = Math.round((width - distanceToCallTarget/100)/26);
        //         c2D = call2D.clone();
        //         c2D.x =  ( width  + c2D.x*width  )/2;
        //         c2D.y = -(-height + c2D.y*height )/2;

        //         this.ctx.fillStyle = this.menu.color;
        //         this.ctx.fillText( enemies[j].name, c2D.x-30, c2D.y+10);
        //         this.ctx.fill();
        //     }
        // }

        // TARGET HUD MARKING
        if ( this.target ) {
            this.target = this.target.root;

            vTarget3D = this.target.position.clone();
            vTarget2D = s.projector.projectVector(vTarget3D, this.camera);

        //     var distanceToTarget, v2D, size;

        //     if ( Math.abs(vTarget2D.x) <= 0.95 && Math.abs(vTarget2D.y) <= 0.95 && vTarget2D.z < 1 ){
        //         targetInSight = true;
        //         distanceToTarget = self.position.distanceTo(this.target.position);
        //         size = Math.round((width - distanceToTarget/100)/26);
        //     }

        //     // Targeting box
        //     if ( targetInSight ){

        //         v2D = vTarget2D.clone();
        //         v2D.x =  ( width  + v2D.x*width  )/2;
        //         v2D.y = -(-height + v2D.y*height )/2;

        //         //BC: Need?
        //         // this.ctx.strokeRect( v2D.x-size, v2D.y-size, size*2, size*2 );
        //         // this.ctx.lineWidth = 1;
        //         // this.ctx.strokeStyle = this.menu.color;

        //     // Radial direction marker
        //     } else {

        //         v2D = new THREE.Vector2(vTarget2D.x, vTarget2D.y);
        //         v2D.multiplyScalar(1/v2D.length()).multiplyScalar(this.subreticleBound.radius+12);

        //         this.ctx.beginPath();
        //         if (vTarget2D.z > 1)
        //             this.ctx.arc( -v2D.x+centerX, (-v2D.y+centerY), 10, 0, 2*this.PI, false);
        //         else
        //             this.ctx.arc( v2D.x+centerX, -(v2D.y-centerY), 10, 0, 2*this.PI, false);

        //         this.ctx.fillStyle = "rgba(256,0,0,0.5)";
        //         this.ctx.fill();
        //         this.ctx.lineWidth = 2;
        //         this.ctx.strokeStyle = this.menu.color;
        //         this.ctx.stroke();

        //     }


        //     /////////////////////////////////
        //     // PREDICTIVE TARGETING SYSTEM //
        //     /////////////////////////////////

        //     // PARAMETERS
        //     // aV   = vector from target to self
        //     // a    = distance between self and target
        //     // eV   = enemy's current velocity vector
        //     // e    = magnitude of eV
        //     // pV   = players's velocity vector
        //     // b    = magnitude of bV plus initial bullet speed
        //     // angD = angular differential
        //     // velD = velocity differential
        //     // t    = quadratic solution for time at which player bullet and enemy ship will simultaneously reach a given location
        //     if ( enemies[i] && targetInSight ){

        //         var aV = enemies[i].root.position.clone().add( self.position.clone().multiplyScalar(-1) );
        //         var a  = aV.length();
        //         var eV = this.target.getLinearVelocity();
        //         var e  = eV.length();
        //         var pV = self.getLinearVelocity();
        //         var b = 5000+pV.length();

        //         if (eV && b && aV){
        //             var angD = aV.dot(eV);
        //             var velD = (b*b - e*e);

        //             var t = angD/velD + Math.sqrt( angD*angD + velD*a*a )/velD;

        //             // Don't show the marker if the enemy is more than 4 seconds away
        //             if (t < 4){

        //                 this.trailingPredictions.push(eV.multiplyScalar(t));
        //                 var pLen = this.trailingPredictions.length;

        //                 // If the previous frames had a prediction, tween the midpoint of all predictions and plot that
        //                 if (pLen > 3){
        //                     var pX = 0, pY = 0;
        //                     for (var p = 0; p < pLen; p++){

        //                         // Project 3D coords onto 2D plane in perspective of the camera;
        //                         // Scale predictions with current camera perspective
        //                         var current = s.projector.projectVector(
        //                             this.target.position.clone().add( this.trailingPredictions[p] ), s.game.camera );
        //                         pX += (width + current.x*width)/2;
        //                         pY += -(-height + current.y*height)/2;

        //                     }
        //                     var enemyV2D = new THREE.Vector2(pX/pLen, pY/pLen);

        //                     if (enemyV2D.distanceTo(v2D) > size/3) {
        //                         // Draw the prediction marker
        //                         this.ctx.beginPath();
        //                         this.ctx.arc(enemyV2D.x, enemyV2D.y, size/5, 0, 2*this.PI, false);
        //                         this.ctx.fillStyle = "rgba(256,0,0,0.5)";
        //                         this.ctx.fill();
        //                         this.ctx.lineWidth = 2;
        //                         this.ctx.strokeStyle = this.menu.color;
        //                         this.ctx.stroke();
        //                     }

        //                     // remove the earliest trailing prediction
        //                     this.trailingPredictions.shift();

        //                 }
        //             }
        //         }
        //     // If the target is no longer on screen, but lastV2D is still assigned, set to null
        //     } else if ( this.trailingPredictions.length ) {
        //         this.trailingPredictions = [];
        //     }
        }

        // ___________________________________________________________________________//

        var now = new Date( ).getTime( );
        var difference = now - this.lastTime;

        var pitch = 0;
        var roll = 0;
        var yaw = 0;

        var thrust = 0;
        var brakes = 0;

        var thrustScalar = this.botOptions.thrustImpulse/s.config.ship.maxSpeed + 1;
        

        var yawSpeed    = this.botOptions.yawSpeed,
            pitchSpeed  = this.botOptions.pitchSpeed;

        
         var botX          = this.root.position.x,
             botY          = this.root.position.y,
             botZ          = this.root.position.z,
             humanX        = this.game.player.root.position.x,
             humanY        = this.game.player.root.position.y,
             humanZ        = this.game.player.root.position.z,
             xDistance     = botX - humanX,
             yDistance     = botY - humanY,
             zDistance     = botZ - humanZ,
             totalDistance = Math.sqrt( Math.pow(xDistance, 2) + Math.pow(yDistance, 2) + Math.pow(zDistance, 2) ),
             maxDistance = 4100,
             minDistance = 1500;

         var autoDistance = self.position.distanceTo(this.game.player.root.position);

        if (totalDistance > maxDistance) {
            thrust = 1;
        }
        else if (totalDistance < minDistance) {
            brakes = 1;
        } else {
            var ratio = (totalDistance - minDistance) / (maxDistance - minDistance);
            var optimumSpeed = s.config.ship.maxSpeed * ratio;
            if (optimumSpeed < this.botOptions.thrustImpulse) { brakes = 1; }
            if (optimumSpeed > this.botOptions.thrustImpulse) { thrust = 1; }
        }

        if (thrust && this.botOptions.thrustImpulse < s.config.ship.maxSpeed){
            this.botOptions.thrustImpulse += difference;
        }

        if (brakes && this.botOptions.thrustImpulse > 0){
            this.botOptions.thrustImpulse -= difference;
        }


        //////////////////////////////
        // TURNING/ALTITUDE LOGIC //
        //////////////////////////////       


        //go left; else if go right
        if (vTarget2D.x < 0) {
            yaw = yawSpeed / thrustScalar;
        } else if (vTarget2D.x > 0) {
            yaw = -1 * yawSpeed / thrustScalar;
        }
        //do down; else if go up
        if (vTarget2D.y < 0) {
            pitch = -1*pitchSpeed / thrustScalar;
        } else if (vTarget2D.y > 0) {
            pitch  = pitchSpeed / thrustScalar;
        }
            
        //////////////////////////////
        // MOTION AND PHYSICS LOGIC //
        //////////////////////////////


        var linearVelocity = this.root.getLinearVelocity().clone();
        var angularVelocity = this.root.getAngularVelocity().clone();
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.extractRotation(this.root.matrix);

        angularVelocity = angularVelocity.clone().divideScalar(this.botOptions.rotationFadeFactor);
        this.root.setAngularVelocity(angularVelocity);

        var newAngularVelocity = new THREE.Vector3(pitch, yaw, roll).applyMatrix4(rotationMatrix).add(angularVelocity);
        this.root.setAngularVelocity(newAngularVelocity);

        var impulse = linearVelocity.clone().negate();
        this.root.applyCentralImpulse(impulse);

        var getForceVector = new THREE.Vector3(0,0, -1*this.botOptions.thrustImpulse).applyMatrix4(rotationMatrix);
        this.root.applyCentralImpulse(getForceVector);

        this.lastTime = now;
    }
});
