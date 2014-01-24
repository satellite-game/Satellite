s.Player = new Class({
	extend: s.Ship,
	construct: function(options) {
		// Nothing here yet...
		// Maybe collision detection and whatnot
		this.HUD = options.HUD;
		this.name = options.name || '';
		this.initialize(options);
	}

});
