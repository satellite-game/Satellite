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
		this.game = options.game;
		this.player = options.player;
		this.camera = options.camera;

		// Create interpreters for controllers
		this.keyboard = new s.Keyboard();

		// Hook to the gameloop		
		this.update = this.update.bind(this);
		this.game.hook(this.update);
	},

	destruct: function() {
		game.unhook(this.update);
	},

	update: function(delta, time) {
		var root = this.player.root;
		var pitch = 0;
		var roll = 0;
		var yaw = 0;
		var thrust = 0;
		var brakes = 0;

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

		if (this.keyboard.pressed('left')) {
			yaw = this.options.yawSpeed;
			
		}
		else if (this.keyboard.pressed('right')) {
			yaw = -1*this.options.yawSpeed;
		}

		if (this.keyboard.pressed('up')) {
			// Pitch down
			pitch = -1*this.options.pitchSpeed;
		}
		else if (this.keyboard.pressed('down')) {
			// Pitch up
			pitch = this.options.pitchSpeed;
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
				this.options.thrustImpulse += 2;
			}
		}		
		if (brakes) {
			if (this.options.thrustImpulse > 0){
				this.options.thrustImpulse -= 2;
			}
		}
		var impulse;
		impulse = linearVelocity.clone().negate();
		root.applyCentralImpulse(impulse);
		var forceVector = new THREE.Vector3(0, 0, -1*this.options.thrustImpulse).applyMatrix4(rotationMatrix);
		root.applyCentralImpulse(forceVector);
	}
});
