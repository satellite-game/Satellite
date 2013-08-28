s.Color = new Class({

	construct: function(options){
        this.red = options.red;
        this.green = options.green;
        this.blue = options.blue;
        this.alpha = options.alpha;
        this.color = "rgba(" + this.red + "," + this.green + "," + this.blue + "," + this.alpha+ ")";
        this.startingColor = this.color;
        this.intervalIDs = [];
	},

	animate: function(options){
		this.intervalIDs.push(setInterval(changeColor,20));
	},
	changeColor: function(options){
		var endingcolor = options.color;
		var redStep = Math.abs(~~(endingcolor.red - this.red))/5;
		var greenStep = Math.abs(~~(endingcolor.green - this.green))/5;
		var blueStep = Math.abs(~~(endingcolor.blue - this.blue))/5;
		var alphaStep = Math.abs(~~(endingcolor.alpha - this.alpha))/5;
	}

});