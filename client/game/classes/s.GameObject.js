s.GameObject = new Class({
	toString: 'GameObject',
	extend: s.EventEmitter,

	construct: function(options) {
		// Bind execution scope of update, if necessary
		if (this.update)
			this.update = this.update.bind(this);
		
		// Store scene for remove
		this.game = options.game;
	},
	
	init: function() {
		// Store a reference to the instance on the object
		// This is used after a collision is detected
		// For instance, to remove HP from the item hit
		if (this.root)
			this.root.instance = this;

		this.add();
	},
	
	destruct: function() {
		// Unhook from the rendering loop
		if (this.update)
			this.game.unhook(this.update);
		
		// Remove from the scene
		if (this.root)
			this.game.scene.remove(this.root);
	},
	
	add: function() {
		// Add mesh to world
		if (this.root)
			this.game.scene.add(this.root);
		
		// Hook to the rendering loop
		if (this.update && !this.hooked) {
			this.game.hook(this.update);
			this.hooked = true;
		}
			
		return this;
	},

	getRoot: function() {
		return this.root;
	},
	
	show: function() {
		this.root.visible = true;
	},
	
	hide: function() {
		this.root.visible = false;
	}
});
