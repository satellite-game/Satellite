s.Controls = new Class({
	toString: 'Controls',

	options: {
		rotationSpeed: Math.PI,
		pitchSpeed: Math.PI/4
	},

	construct: function(options) {
		// Store references to game objects
		this.game = options.game;
		this.player = options.player;

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
		var pitch = 0;
		var roll = 0;

		if (this.keyboard.pressed('left')) {
			// Roll left
			roll = this.options.rotationSpeed;
		}
		else if (this.keyboard.pressed('right')) {
			// Roll right
			roll = -1*this.options.rotationSpeed;
		}
		else {
			// Stop rolling
			roll = 0;
		}

		if (this.keyboard.pressed('up')) {
			// Pitch down
			pitch = -1*this.options.pitchSpeed;
		}
		else if (this.keyboard.pressed('down')) {
			// Pitch up
			pitch = this.options.pitchSpeed;
		}
		else {
			// Stop pitching
			pitch = 0;
		}

		// Apply rotation
		// lazd: This is totally a dumb thing to do
		// lazd: When keys are pressed, we should ADD to the existing angular velocity,
		// lazd: When keys aren't pressed, we should bleed off angular velocity towards zero
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.extractRotation(this.player.root.matrix);
		var angularVelocity = new THREE.Vector3(pitch, 0, roll).applyMatrix4(rotationMatrix);
		this.player.root.setAngularVelocity(angularVelocity);

		// Apply thrust
		// lazd: This is totally a dumb thing to do
		// lazd: I don't really know how to handle this...
		// lazd: We could continously apply an impulse, but that would result in acceleration
		var forceVector = new THREE.Vector3(0, 0, -500).applyMatrix4(rotationMatrix);
		this.player.root.setLinearVelocity(forceVector);
	}
});
