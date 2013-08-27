s.Player = new Class({
	extend: s.Ship,
	construct: function(options) {
		// Nothing here yet...
		// Maybe collision detection and whatnot
	this.game.hook(this.update);
	this.oldShields = 0;
	
	},
	update: function() {
		if (this.hull <= 0){
			this.game.handleDie();
		}
	}
});
