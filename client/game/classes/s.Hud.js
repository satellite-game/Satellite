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

        ///////////////////////
        // RADIAL SUBRETICLE //
        ///////////////////////

        var velocity = this.controls.options.thrustImpulse/10,
            height = window.innerHeight,
            width = window.innerWidth,
            centerX = width/ 2,
            centerY = height/2;

        this.canvas.height = height;
        this.canvas.width = width;
        this.ctx.clearRect(0, 0, height, width);

        // Vector for cursor location centered around the center of the screen
        this.cursorVector = new THREE.Vector2(this.targetX - centerX, this.targetY - centerY);

		var borderWidth = width/8;

		var borderHeight = height/8;

		this.ctx.font = '30px Futura';
		this.ctx.rect(100, 50, velocity, 10);
		this.ctx.fillStyle = '#5DFC0A';
		this.ctx.fillText("Throttle",100,40);
        this.ctx.fill();

        this.ctx.rect(100,50,200,1);
        this.ctx.fill();

        this.ctx.font = '10px Futura';
        this.ctx.fillText("SET",93 + velocity,80);

        this.subreticleBound.radius = width/8;
        this.ctx.beginPath();
        this.ctx.arc( centerX, centerY, this.subreticleBound.radius, 0, 2*Math.PI, false);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#5DFC0A';
        this.ctx.stroke();

        if (this.cursorVector.length() > this.subreticleBound.radius) {
            this.cursorVector.normalize().multiplyScalar(this.subreticleBound.radius);
            this.targetX = this.cursorVector.x+centerX;
            this.targetY = this.cursorVector.y+centerY;
        }


		this.ctx.drawImage(this.crosshairs,centerX - this.crosshairs.width/2,centerY - this.crosshairs.height/2);

		this.ctx.drawImage(this.subreticle,this.targetX - this.subreticle.width/2,this.targetY - this.subreticle.height/2);


        //////////////////////////////
        ///  ENEMY-LOCK INDICATOR  ///
        //////////////////////////////

        /**
         Get 2D coordinates from a Vector3

         @param {THREE.Vector3} objVector  Vector representing the object position
         @param {Number} width  Width of canvas
         @param {Number} height  Height of canvas
         */
        // TODO: Fix the z-axis messing up the result

        this.lockedOn = true;
        if ( this.lockedOn ){


            this.target = s.game.moon.root.position;
            var vector3D = this.target.clone();
            var vector2D = s.projector.projectVector(vector3D, s.game.camera);

            if ( Math.abs(vector2D.x) <= 0.95 && Math.abs(vector2D.y) <= 0.95 && vector2D.z < 1 ){

                vector2D.x =  ( width  + vector2D.x*width  )/2;
                vector2D.y = -(-height + vector2D.y*height )/2;

                var size = 50;

                this.ctx.strokeRect( vector2D.x-size, vector2D.y-size, size*2, size*2 );
                this.ctx.lineWidth = 5;
                this.ctx.strokeStyle = '#5DFC0A';

            } else {

                var v2D = new THREE.Vector2(vector2D.x, vector2D.y);
                v2D.multiplyScalar(1/v2D.length()).multiplyScalar(this.subreticleBound.radius+15);

                this.ctx.beginPath();
                if (vector2D.z > 1)
                    this.ctx.arc( -v2D.x+centerX, (-v2D.y+centerY), 10, 0, 2*Math.PI, false);
                else
                    this.ctx.arc( v2D.x+centerX, -(v2D.y-centerY), 10, 0, 2*Math.PI, false);

                this.ctx.fillStyle = "black";
                this.ctx.fill();
                this.ctx.lineWidth = 5;
                this.ctx.strokeStyle = '#5DFC0A';
                this.ctx.stroke();

            }


            /////////////////////////////////
            // PREDICTIVE TARGETING SYSTEM //
            /////////////////////////////////


        } else {

        }

	}

});
