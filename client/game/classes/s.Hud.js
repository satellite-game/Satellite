s.HUD = new Class({
	toString: "HUD",

	construct: function(options){

        // DELETE ME!!! //////////////////////////
        this.dummyData = [];
        // DELETE THAT! //////////////////////////

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
        this.menu = new s.Color({
            red: 0,
            green: 256,
            blue: 0,
            alpha: 0.9
        });
        this.hit = new s.Color({
            red: 256,
            green: 256,
            blue: 256,
            alpha: 1
        });
        this.hull = new s.Color({
            red: 256,
            green: 0,
            blue: 0,
            alpha: 1
        });
        this.shields = new s.Color({
            red: 0,
            green: 200,
            blue: 256,
            alpha: 1
        });

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

		this.ctx.fillStyle = this.menu.color;
		this.ctx.font = '20px Futura';
		this.ctx.fillRect(100, 50, velocity, 10);
        this.ctx.fillRect(100,50,200,1);
        this.ctx.fillText("THROTTLE",100,40);
        this.ctx.font = '10px Futura';
        this.ctx.fillText("SET",95 + velocity,75);

        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '20px Futura';
        this.ctx.fillRect(100, 170, (this.game.player.hull/s.config.ship.hull) * 200, 10);
        this.ctx.fillRect(100,170,200,1);
        this.ctx.fillText("HULL",100,160);


        this.ctx.fillStyle = '#00FFFF';

        this.ctx.font= '20px Futura';
        this.ctx.fillRect(100, 110, (this.game.player.shields/s.config.ship.shields) * 200, 10);
        this.ctx.fillRect(100,110,200,1);
        this.ctx.fillText("SHIELDS",100,100);

        this.subreticleBound.radius = width/8;
        this.ctx.beginPath();
        this.ctx.arc( centerX, centerY, this.subreticleBound.radius, 0, 2*Math.PI, false);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.menu.color;
        this.ctx.stroke();


        if (this.cursorVector.length() > this.subreticleBound.radius) {
            this.cursorVector.normalize().multiplyScalar(this.subreticleBound.radius);
            this.targetX = this.cursorVector.x+centerX;
            this.targetY = this.cursorVector.y+centerY;
        }

        this.ctx.beginPath();
        this.ctx.fillStyle = this.menu.color;
        this.ctx.arc(this.targetX, this.targetY, 5, 0, 2 * Math.PI, false);

        this.ctx.fill();

		this.ctx.drawImage(this.crosshairs,centerX - this.crosshairs.width/2,centerY - this.crosshairs.height/2);


        //////////////////////////////////
        /////  ENEMY-LOCK INDICATOR  /////
        //////////////////////////////////
        // TODO: Fix the z-axis messing up the result

        ///////////////////////////
        // MOON TARGETING SYSTEM //
        ///////////////////////////

        this.moon = s.game.moon.root;

        var vMoon3D = this.moon.position.clone();
        var vMoon2D = s.projector.projectVector( vMoon3D, s.game.camera );
        var moonInSight = Math.abs(vMoon2D.x) <= 0.95 && Math.abs(vMoon2D.y) <= 0.95 && vMoon2D.z < 1 ? true : false;

        // Moon targeting reticule
        if ( !moonInSight ) {

            var moon2D = new THREE.Vector2(vMoon2D.x, vMoon2D.y);
            moon2D.multiplyScalar(1/moon2D.length()).multiplyScalar(this.subreticleBound.radius+34);

            this.ctx.beginPath();
            if (vMoon2D.z > 1)
                this.ctx.arc( -moon2D.x+centerX, (-moon2D.y+centerY), 10, 0, 2*Math.PI, false);
            else
                this.ctx.arc( moon2D.x+centerX, -(moon2D.y-centerY), 10, 0, 2*Math.PI, false);

            this.ctx.fillStyle = "red";
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 0xffffff;
            this.ctx.stroke();
        }


        ////////////////////////////
        // ENEMY TARGETING SYSTEM //
        ////////////////////////////

        if (s.game.enemies.list()[1])
            this.lockedOn = true;

        var i = 1 || enemyLockIndex;
        this.target = this.lockedOn ? s.game.enemies.list()[i].root : null;

        var targetInSight = false;

        if ( this.target ) {

            var vTarget3D =this.target.position.clone();
            var vTarget2D = s.projector.projectVector(vTarget3D, s.game.camera);

            if ( Math.abs(vTarget2D.x) <= 0.95 && Math.abs(vTarget2D.y) <= 0.95 && vTarget2D.z < 1)
                targetInSight = true;

            var v2D;
            // Targeting box
            if ( targetInSight ){
                v2D = vTarget2D.clone();
                v2D.x =  ( width  + v2D.x*width  )/2;
                v2D.y = -(-height + v2D.y*height )/2;

                var size = 50;

                this.ctx.strokeRect( v2D.x-size, v2D.y-size, size*2, size*2 );
                this.ctx.lineWidth = 1;
                this.ctx.strokeStyle = this.menu.color;

                // Radial direction marker
            } else {

                v2D = new THREE.Vector2(vTarget2D.x, vTarget2D.y);
                v2D.multiplyScalar(1/v2D.length()).multiplyScalar(this.subreticleBound.radius+12);

                this.ctx.beginPath();
                if (vTarget2D.z > 1)
                    this.ctx.arc( -v2D.x+centerX, (-v2D.y+centerY), 10, 0, 2*Math.PI, false);
                else
                    this.ctx.arc( v2D.x+centerX, -(v2D.y-centerY), 10, 0, 2*Math.PI, false);

                this.ctx.fillStyle = "black";
                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = this.menu.color;
                this.ctx.stroke();

            }

            /////////////////////////////////
            // PREDICTIVE TARGETING SYSTEM //
            /////////////////////////////////

         // t = ( (a ev cos[beta]) + sqrt[(a ev cos[beta])^2 + (bv^2-ev^2)(a^2)] )  / (bv^2 - ev^2)

            // PARAMETERS
            // a    = distance between self and target
            // eV   = magnitude of enemy's current velocity vector
            // bV   = magnitude of bullet's velocity vector
            // beta = angle between a and eV, via dot product
            // angD = angular differential; scales down with increased beta
            // velD = velocity
            // top  = upper quotient for quadratic solution
            // bot  = lower quotient for quadratic solution
            // t    = time at which player bullet and enemy ship will simultaneously reach a given location
            if ( s.game.enemies.list()[1] && targetInSight ){

                var self = s.game.player.root;
                var aV = vTarget3D.add( self.position.clone().multiplyScalar(-1) );
                var a  = aV.length();
                var eV = this.target.getLinearVelocity();
                var e  = eV.length();
                var pV = self.getLinearVelocity();
                var b = 5000+pV.length();

                //if (Math.abs(beta) > Math.PI/2)
                //    debugger;

                if (eV && b && aV){

                    //var beta = Math.acos(aV.dot(eV)/(a*e));
                    //var angD1 = a*e*Math.cos(beta);
                    var angD = aV.dot(eV);
                    var velD = (b*b - e*e);

                    var t = angD/velD + Math.sqrt( angD*angD + velD*a*a )/velD;

                    if (t < 5){
                            var enemyV2D = s.projector.projectVector(this.target.position.clone().add(eV.multiplyScalar(t)), s.game.camera);
                            enemyV2D.x =  ( width  + enemyV2D.x*width  )/2;
                            enemyV2D.y = -(-height + enemyV2D.y*height )/2;
                            this.ctx.beginPath();
                            this.ctx.arc(enemyV2D.x, enemyV2D.y, 10, 0, 2*Math.PI, false);
                            this.ctx.fillStyle = "black";
                            this.ctx.fill();
                            this.ctx.lineWidth = 5;
                            this.ctx.strokeStyle = this.menu.color;
                            this.ctx.stroke();
                        }
                    }
                }
            }

        }

});
