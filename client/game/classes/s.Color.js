s.Color = new Class({

	construct: function( options ){
		this.red = options.red;

		this.green = options.green;

		this.blue = options.blue;

		this.alpha = options.alpha;


		this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";

		this.startingColor = {
			red: this.red,
			green: this.green,
			blue: this.blue,
			alpha: this.alpha,
			color: "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")"
		};


		this.intervalIDs = [];

		this.timesCounted = 0;
	},

	animate: function( options ){
		for (var i = 0; i < this.intervalIDs.length; i++){
			clearInterval(this.intervalIDs[i]);
		}

		this.timesCounted = 0;

		if (!options.fading){
			this.red = this.startingColor.red;
			this.green = this.startingColor.green;
			this.blue = this.startingColor.blue;
			this.alpha = this.startingColor.alpha;
			this.color = this.startingColor.color;
		}
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

		var endColor = options.color;

		if (this.timesCounted === options.frames){
			for (var i = 0; i < this.intervalIDs.length; i++){
				clearInterval(this.intervalIDs[i]);
			}

			this.red = endColor.red;
			this.green = endColor.green;
			this.blue = endColor.blue;
			this.alpha = endColor.alpha;
			this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";

			if (this.color !== this.startingColor.color){
				this.animate({
					color:{
						red: this.startingColor.red,
						green: this.startingColor.green,
						blue: this.startingColor.blue,
						alpha: this.startingColor.alpha
					},
					frames: options.frames,
					fading: true
				});
			}
		} else {


		var frames = options.frames,

		redStep = options.redStep,

		greenStep = options.greenStep,

		blueStep = options.blueStep,

		alphaStep = options.alphaStep;


		if(this.red < endColor.red){
			this.red += redStep;	
		} 
		else if (this.red > endColor.red) {
			this.red -= redStep;
		}

		if(this.green < endColor.green){
			this.green += greenStep;	
		} 
		else if (this.green > endColor.green) {
			this.green -= greenStep;
		}


		if(this.blue < endColor.blue){
			this.blue += blueStep;	
		} 
		else if (this.blue > endColor.blue) {
			this.blue -= blueStep;
		}

		if(this.alpha < endColor.alpha){
			this.alpha += alphaStep;	
		} 
		else if (this.alpha > endColor.alpha) {
			this.alpha -= alphaStep;
		}

		this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";

		this.timesCounted ++;
		}
	}
});