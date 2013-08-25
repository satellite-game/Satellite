s.Controls = new Class({
	toString: 'Controls',

	options: {
		rotationSpeed: Math.PI/2,
		pitchSpeed: Math.PI/6,
		yawSpeed: Math.PI/6,
		thrustImpulse: 0,
		brakePower: 0.85,
		velocityFadeFactor: 16,
		rotationFadeFactor: 4
	},

	construct: function(options) {
		// Store references to game objects
		this.HUD = options.HUD;
		this.game = options.game;
		this.player = options.player;
		this.camera = options.camera;

		// Create interpreters for controllers
		this.keyboard = new s.Keyboard();
		// Hook to the gameloop
		this.update = this.update.bind(this);
		this.game.hook(this.update);

		this.firing = false;
		this.lastTime = new Date().getTime();
	},

	destruct: function() {
		game.unhook(this.update);
	},

	update: function(time, delta) {
		var now = new Date().getTime();
		var difference = now - this.lastTime;
		var root = this.player.root;
		var pitch = 0;
		var roll = 0;
		var yaw = 0;
		var thrust = 0;
		var brakes = 0;
		var thrustScalar = this.options.thrustImpulse/1000 + 1;
		var centerY = this.HUD.canvas.height/2;
		var centerX = this.HUD.canvas.width/2;

		if (this.keyboard.pressed('backtick')) {
			root.position.set(10000, 2000, 10000);
			root.rotation.set(0, Math.PI/4, 0);
			root.setAngularVelocity(new THREE.Vector3());
			root.setLinearVelocity(new THREE.Vector3());

			// Tell the physics engine to update our position
			root.__dirtyPosition = true;
			root.__dirtyRotation = true;
			return;
		}

		if (this.HUD.targetX < this.HUD.canvas.width/2){
			yaw = this.options.yawSpeed/(this.HUD.subreticleBound.left/((centerX - this.HUD.targetX) * 4))  / thrustScalar;
		}
		if (this.HUD.targetX > this.HUD.canvas.width/2){
			yaw = -1 * (this.options.yawSpeed/(this.HUD.subreticleBound.right/((this.HUD.targetX - centerX) * 4))) / thrustScalar;
		}
		if (this.HUD.targetY < this.HUD.canvas.height/2){
			pitch = this.options.pitchSpeed/(this.HUD.subreticleBound.top/((centerY - this.HUD.targetY) * 4)) /  thrustScalar;
		}
		if (this.HUD.targetY > this.HUD.canvas.height/2){
			pitch = -1 * (this.options.pitchSpeed/(this.HUD.subreticleBound.top/((this.HUD.targetY - centerY) * 4)))  / thrustScalar;
		}
		if (this.HUD.targetY > centerY - this.HUD.crosshairs.height/2 && this.HUD.targetY < centerY + this.HUD.crosshairs.height/2){
			pitch = 0;
		}
		if (this.HUD.targetX > centerX - this.HUD.crosshairs.width/2 && this.HUD.targetX < centerX + this.HUD.crosshairs.width/2){
			yaw = 0;
		}

		if (this.keyboard.pressed('left')) {
			this.HUD.targetX = centerX;
			this.HUD.targetY = centerY;
			yaw = this.options.yawSpeed / thrustScalar;

		}
		else if (this.keyboard.pressed('right')) {
			this.HUD.targetX = centerX;
			this.HUD.targetY = centerY;
			yaw = -1*this.options.yawSpeed / thrustScalar;
		}

		if (this.keyboard.pressed('up')) {
			// Pitch down
			this.HUD.targetX = centerX;
			this.HUD.targetY = centerY;
			pitch = -1*this.options.pitchSpeed / thrustScalar;
		}
		else if (this.keyboard.pressed('down')) {
			// Pitch up
			this.HUD.targetX = centerX;
			this.HUD.targetY = centerY;
			pitch = this.options.pitchSpeed / thrustScalar;
		}

		if (this.keyboard.pressed('w')) {
			thrust = 1;
		}
		else if (this.keyboard.pressed('s')) {
			brakes = 1;
		}

		if (this.keyboard.pressed('a')) {
			roll = this.options.rotationSpeed;
		}
		else if (this.keyboard.pressed('d')) {
			roll = -1*this.options.rotationSpeed;
		}

		if(this.keyboard.pressed('space')){
			this.player.fire('missile');
		}

		if (this.firing){
			this.player.fire('turret');
		}

		var linearVelocity = root.getLinearVelocity().clone();
		var angularVelocity = root.getAngularVelocity().clone();
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.extractRotation(root.matrix);

		// Apply rotation
		// Bleed off angular velocity towards zero
		angularVelocity = angularVelocity.clone().divideScalar(this.options.rotationFadeFactor);
		root.setAngularVelocity(angularVelocity);

		// Add to the existing angular velocity,
		var newAngularVelocity = new THREE.Vector3(pitch, yaw, roll).applyMatrix4(rotationMatrix).add(angularVelocity);
		root.setAngularVelocity(newAngularVelocity);

		// Apply thrust
		// Invert existing linear velocity
		// Fractionally apply the opposite impulse
		// Then apply forward impulse
		if (thrust){
			if (this.options.thrustImpulse < 2000){
				this.options.thrustImpulse += difference;
			}
		}
		if (brakes) {
			if (this.options.thrustImpulse > 0){
				this.options.thrustImpulse -= difference;
			}
		}
        var impulse;
		impulse = linearVelocity.clone().negate();
		root.applyCentralImpulse(impulse);
		var forceVector = new THREE.Vector3(0, 0, -1*this.options.thrustImpulse).applyMatrix4(rotationMatrix);
		root.applyCentralImpulse(forceVector);
		this.lastTime = now;
	}
});
