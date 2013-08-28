s.Sound = new Class({
	toString: 'Sound',
	
	construct: function(options) {
		this.enabled = options.enabled !== undefined ? options.enabled : true;

		this.sounds = options.sounds || {};
		
		this.ready = {};
		
		this.preload();
	},
	
	destruct: function() {
		// TODO: Remove event listeners from Audio objects?
		this.ready = {};
	},
	
	preload: function() {
		// Preload each sound
		for (var name in this.sounds) {
			var soundUrl = this.sounds[name];
			
			// Create array to hold Audio instances
			this.ready[soundUrl] = [];
			
			// Create an instance of each sound
			this.ready[soundUrl].push(this.create(soundUrl));
		}
	},
	
	create: function(soundUrl) {
		// Create a new Audio object with the URL provided
		var soundObj = new Audio(soundUrl);
		
		var that = this;
		
		// When the Audio is done playing, add it back to the ready array
		soundObj.addEventListener('ended', function() {
			that.ready[soundUrl].push(soundObj);
		});
		
		return soundObj;
	},
	
	getInstance: function(name) {
		// Check if we have the requested sound
		var soundUrl = this.sounds[name];
		if (!soundUrl) {
			console.error('Bug: invalid sound requested');
			return false;
		}
		
		// Create ready array, if necessary. Only required if preload() isn't called
		if (!this.ready[soundUrl])
			this.ready[soundUrl] = [];
		
		// Check for an already created Audio instance to use
		var soundObj;
		if (this.ready[soundUrl].length) {
			// Pull the Audio instance from the ready array
			soundObj = this.ready[soundUrl].shift();
		}
		else {
			// Create a new Audio instance
			soundObj = this.create(soundUrl);
		}
		
		return soundObj;
	},
	
	play: function(name, volume) {
		if (!this.enabled)
			return false;
		
		var soundObj = this.getInstance(name);
		
		soundObj.volume = volume || 1;

		// Play the sound
		if (soundObj)
			soundObj.play();
	}
});