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

		var velocity = this.controls.options.thrustImpulse/10;


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

		this.ctx.clearRect(0,0,this.canvas.height,this.canvas.width);
		
		this.ctx.font= '30px Futura';
		this.ctx.rect(100, 50, velocity, 10);
		this.ctx.fillStyle = '#33FF00';

		this.ctx.fillText("Throttle",100,40);
        this.ctx.fill();

        this.ctx.rect(100,50,200,1);
        this.ctx.fill();
        this.ctx.font = '10px Futura';
        this.ctx.fillText("SET",93 + velocity,80);

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

		this.ctx.drawImage(this.subreticle,this.targetX - this.subreticle.width/2,this.targetY - this.subreticle.height/2);


        //////////////////////////
        // ENEMY-LOCK INDICATOR //
        //////////////////////////

        /**
         Get 2D coordinates from a Vector3

         @param {THREE.Vector3} objVector  Vector representing the object position
         @param {Number} width  Width of canvas
         @param {Number} height  Height of canvas
//         */
//        this.lockedOn = true;
//        if ( this.lockedOn ){
//
//            var height = window.innerHeight;
//            var width  = window.innerWidth;
//
//            this.target = s.game.moon.root.position;
//            var vector3D = this.target.clone();
//            var vector2D = s.projector.projectVector(vector3D, s.game.camera);
//
//            if (Math.abs(vector2D.x) <= 1 && Math.abs(vector2D.y) <= 1){
//
//                vector2D.x = ( width  + vector2D.x*width  )/2;
//                vector2D.y = ( height + vector2D.y*height )/2;
//                console.log(vector2D);
//                this.inScope = true;
//
//            } else {
//
//                if ( Math.abs(vector2D.x*width) > Math.abs(vector2D.y*height) ){
//                    vector2D.x
//                }
//                vector2D.x = ( vector2D.x );
//                vector2D.y = (  );
//                this.inScope = false;
//
//            }
//
//
//            if ( this.lockedOn && this.inScope ) {
//
//                this.ctx.strokeRect( vector2D.x-5, vector2D.y-5, vector2D.x+5, vector2D.y+5 );
//                this.ctx.lineWidth = 5;
//                this.ctx.strokeStyle = '0xff0000';
//
//            } else {
//
//                this.ctx.beginPath();
//                this.ctx.arc( vector2D.x, vector2D.y, 10, 0, 2*Math.PI, false);
//                this.ctx.fillStyle = "0x0000ff";
//                this.ctx.fill();
//                this.ctx.lineWidth = 5;
//                this.ctx.strokeStyle = '0xff0000';
//                this.ctx.stroke();
//
//            }
//
//        } else {
//
//        }

	}

});
