s.Color = new Class({

	construct: function( options ){
		this.red = options.red;

		this.green = options.green;

		this.blue = options.blue;

		this.alpha = options.alpha;


		this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";

		this.startingColor = this.color;


		this.intervalIDs = [];

		this.timesCounted = 0;
	},

	animate: function( options ){
		this.timesCounted = 0;

		this.color = this.startingColor;

		var self = this,

		endColor = options.color,

		frames = options.frames;

		options.redStep = Math.abs(~~((endColor.red - this.red)/frames));

		options.greenStep = Math.abs(~~((endColor.green - this.green)/frames));

		options.blueStep = Math.abs(~~((endColor.blue - this.blue)/frames));

		options.alphaStep = Math.abs(~~((endColor.alpha - this.alpha)/frames));

		this.intervalIDs.push(setInterval(function(){
			self.changeColor( options );
		}, 20)
		);
	},

	changeColor: function( options ){
		if (this.timesCounted === options.frames){
			for (var i = 0; i < this.intervalIDs; i++){
				clearInterval(this.intervalIDs[i]);
			}
			this.color = this.startingColor;
		} else {
		var endColor = options.color,

		frames = options.frames,

		redStep = options.redStep,

		greenStep = options.greenStep,

		blueStep = options.blueStep,

		alphaStep = options.alphaStep;


		if(this.red < endColor.red){
			this.red += redStep;	
		} else {
			this.red -= redStep;
		}

		if(this.green < endColor.green){
			this.green += greenStep;	
		} else {
			this.green -= greenStep;
		}

		if(this.blue < endColor.blue){
			this.blue += blueStep;	
		} else {
			this.blue -= blueStep;
		}

		if(this.alpha < endColor.alpha){
			this.alpha += alphaStep;	
		} else {
			this.alpha -= alphaStep;
		}

		this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";

		this.timesCounted ++;
		}
	}
});