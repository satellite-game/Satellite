s.HUD = new Class({
	construct: function(options){
		this.game = options.game;
		this.controls = options.controls;
		this.canvas = document.createElement('canvas');
		this.canvas.style.position = 'absolute';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.ctx = this.canvas.getContext('2d');


		this.update = this.update.bind(this);
		this.game.hook(this.update);
		document.body.appendChild(this.canvas);
	},
	update: function(){
		var velocity = "Velocity: " + String(this.controls.options.thrustImpulse);
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		this.ctx.font= '30px Futura';
		this.ctx.fillStyle = '#33FF00';
		this.ctx.fillText(velocity,125,50);
	}

});