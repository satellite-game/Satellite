s.HUD = new Class({
	toString: "HUD",

	construct: function(options){


		this.game = options.game;

		this.controls = options.controls;


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


		this.update = this.update.bind(this);

		this.game.hook(this.update);


		document.body.appendChild(this.canvas);

	},
	update: function(){

		var velocity = "Throttle: " + String(this.controls.options.thrustImpulse);


		this.canvas.height = window.innerHeight;

		this.canvas.width = window.innerWidth;

		var centerY = this.canvas.height/2;

		var centerX = this.canvas.width/2;

		var borderWidth = this.canvas.width/8;

		var borderHeight = this.canvas.height/8;



		this.subreticleBound.left = centerX - borderWidth;

		this.subreticleBound.right = centerX + borderWidth;

		this.subreticleBound.top = centerY - borderHeight;

		this.subreticleBound.bottom = centerY + borderHeight;


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


		this.ctx.drawImage(this.crosshairs,centerX - this.crosshairs.width/2,centerY - this.crosshairs.height/2);
		
		this.ctx.drawImage(this.subreticle,this.targetX,this.targetY);
	}

});