s.Bot = new Class( {
	toString: 'Bot',

	construct: function( options ) {
		this.aVeloc = options.aVeloc;
		this.lVeloc = options.lVeloc;
		this.interp = true;
		this.name = options.name;
		this.pos = options.position;
		this.rot = options.rotation;
		this.bot = true;
	}

} );