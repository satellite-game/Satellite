s.HUD = new Class({
	construct: function(options){
		this.game = options.game;
		this.player = options.player;
		this.canvas = document.createElement('canvas');
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		this.canvas.style.position = 'absolute';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.ctx = this.canvas.getContext('2d');
		this.crosshairs = new Image();
		this.crosshairs.src = 'game/textures/crosshairs.png';
		this.subreticle = new Image();
		this.subreticle.src = 'game/textures/Subreticle.png';
		this.targetX = 0;
		this.targetY = 0;
		this.subreticleBound = {};
		this.subreticleBound.left = this.canvas.width/2 - this.canvas.width/8;
		this.subreticleBound.right = this.canvas.width/2 + this.canvas.width/8;
		this.subreticleBound.top = this.canvas.height/2 - this.canvas.height/8;
		this.subreticleBound.bottom = this.canvas.height/2 + this.canvas.height/8;
		this.update = this.update.bind(this);
		this.game.hook(this.update);
		document.body.appendChild(this.canvas);
	},
	update: function(){
		var velocity = "Throttle: " + String(this.controls.options.thrustImpulse);
		this.canvas.height = window.innerHeight;
		this.canvas.width = window.innerWidth;
		this.subreticleBound.left = this.canvas.width/2 - this.canvas.width/8;
		this.subreticleBound.right = this.canvas.width/2 + this.canvas.width/8;
		this.subreticleBound.top = this.canvas.height/2 - this.canvas.height/8;
		this.subreticleBound.bottom = this.canvas.height/2 + this.canvas.height/8;
		this.ctx.font= '30px Futura';
		this.ctx.fillStyle = '#33FF00';
		this.ctx.fillText(velocity,125,50);
		if (this.targetX < this.subreticleBound.left){
			this.targetX = this.subreticleBound.left;
		}
		if (this.targetX > this.subreticleBound.right){
			this.targetX = this.subreticleBound.right;
		}
		if (this.targetY < this.subreticleBound.top){
			this.targetY = this.subreticleBound.top;
		}
		if (this.targetY > this.subreticleBound.bottom){
			this.targetY = this.subreticleBound.bottom;
		}

		this.ctx.drawImage(this.crosshairs,this.canvas.width/2- this.crosshairs.width/2,this.canvas.height/2-this.crosshairs.height/2);
		this.ctx.drawImage(this.subreticle,this.targetX,this.targetY);
	}

});