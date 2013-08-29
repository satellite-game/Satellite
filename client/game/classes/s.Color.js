s.Color = new Class({

	toString: "color",

	construct: function( options ){

		//upon construction we set the color's properties to the passed in options'
		this.game = options.game;

		this.red = options.red;

		this.green = options.green;

		this.blue = options.blue;

		this.alpha = options.alpha;


		this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";


		//storing the initial color, as the classes' color is dynamically animated later on and needs to be reset to initialization parameters

		this.startingColor = {

			red: this.red,

			green: this.green,

			blue: this.blue,

			alpha: this.alpha,

			color: "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")"

		};

		//this stores the ongoing  animations

		this.intervalIDs = [];

		//pseudo-global memory of how many frames the animation has been playing for

		this.timesCounted = 0;

	},

	animate: function( options ){


		//animate starts up an asynchronous loop for changeColor and passes in some custom options


		//clears all ongoing animations

		if (this.color !== this.startingColor.color){
			this.game.unhook(this.changeColor);
		}

		
		//reinitializes the frame count

		this.timesCounted = 0;


		//if we're animating to a new color, instead of animating back to the initial one, we reset the colors

		if ( !options.fading ){

			this.red = this.startingColor.red;

			this.green = this.startingColor.green;

			this.blue = this.startingColor.blue;

			this.alpha = this.startingColor.alpha;

			this.color = this.startingColor.color;

		}


		//initializing the options we intend to pass into change color

		var self = this;

		this.endColor = options.color;

		this.frames = options.frames;

		var endColor = this.endColor;

		this.redStep = Math.abs(~~((endColor.red - this.red)/frames));

		this.greenStep = Math.abs(~~((endColor.green - this.green)/frames));

		this.blueStep = Math.abs(~~((endColor.blue - this.blue)/frames));

		this.alphaStep = Math.abs(~~((endColor.alpha - this.alpha)/frames));

		this.changeColor = this.changeColor.bind(this);
        this.game.hook(this.changeColor);

	},

	changeColor: function(){


		//changeColor is repetitively called by animate and changes this classes color to a target one in steps

		var endColor = this.endColor;


		//if we've reached the target amount of frames we clear animatons and then recursively call animate to change the color back to it's initial state

		if ( this.timesCounted === this.frames ){

			this.game.unhook(this.changeColor);

			this.red = endColor.red;

			this.green = endColor.green;

			this.blue = endColor.blue;

			this.alpha = endColor.alpha;

			this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";


			if ( this.color !== this.startingColor.color ){

				this.animate({

					color:{

						red: this.startingColor.red,

						green: this.startingColor.green,

						blue: this.startingColor.blue,

						alpha: this.startingColor.alpha

					},

					frames: this.frames,

					fading: true

				});
			}

		} else {

		var frames = this.frames,

		redStep = this.redStep,

		greenStep = this.greenStep,

		blueStep = this.blueStep,

		alphaStep = this.alphaStep;


		if( this.red < endColor.red ){

			this.red += redStep;	

		} 
		else if ( this.red > endColor.red ) {

			this.red -= redStep;

		}

		if( this.green < endColor.green ){

			this.green += greenStep;

		} 
		else if ( this.green > endColor.green ) {

			this.green -= greenStep;

		}


		if( this.blue < endColor.blue ){

			this.blue += blueStep;	

		} 
		else if ( this.blue > endColor.blue ) {

			this.blue -= blueStep;

		}

		if( this.alpha < endColor.alpha ){

			this.alpha += alphaStep;	

		} 
		else if ( this.alpha > endColor.alpha ) {

			this.alpha -= alphaStep;

		}


		this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha + ")";


		this.timesCounted ++;

		}
	}
});