s.Bot = new Class( {
	toString: 'Bot',

	construct: function( options ) {
		this.aVeloc = [0, 0, 0];
		this.lVeloc = [0, 0, 0];
		this.interp = true;
		this.name = options.name;
		this.pos = options.position;
		this.rot = options.rotation;
	}

} );