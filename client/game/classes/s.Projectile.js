s.Projectile = new Class({
	extend: s.GameObject,

    construct: function(options){
        this.HUD = options.HUD || null;
        this.game = options.game;
        this.comm = this.game.comm;
        this.game = options.game;
        this.pilot = options.pilot;
        this.isBot = options.isBot;
        this.team = options.team;
        // handle parameters
        this.initialVelocity = options.initialVelocity;
        var that = this;
        // Destory projectile after 4 secs
        setTimeout(function(){
            that.destruct();
        }, 4000);
    },

	init: function(_super){
        _super.call(this);
        this.applyForce();
    },

    handleCollision: function(mesh, position){
        //check if your turret hit someone or an enemy base
        //else if check if you got hit by a bot or if a bot hit your base
        if (this.pilot === this.game.pilot.name){
            if (mesh.instance.alliance && mesh.instance.alliance === "rebel"){
                this.HUD.menu.animate({
                color: this.HUD.hit,
                frames: 30
                });
                if(mesh.instance.shields > 0){
                    new s.Shield({
                        game: this.game,
                        ship: mesh
                    });
                }
                this.comm.hit(mesh.name,this.game.pilot.name);
            }
            if (mesh.name === 'moonBaseTall') {
                this.comm.baseFire(mesh.name, this.pilot);
            }
        } else if (this.isBot) {
            if (mesh.name === this.game.pilot.name) {
                this.comm.botHit(mesh.name, this.pilot);
            } else if (mesh.name === 'spaceStation' && this.game.hostPlayer) {
                this.comm.baseFire(mesh.name, this.pilot);
            }
        } 
        this.destruct();
    },

    applyForce: function() {
        // Take on the initial velocity
        this.root.setLinearVelocity(this.initialVelocity);

        // Apply an impulse to move forward
        this.root.applyCentralImpulse(this.getForceVector());
    },

    getForceVector: function(){
        // Make sure the projectile's matrix is up to date
        this.root.updateMatrix();

        // Extract the rotation from the projectile's matrix
        this.rotationMatrix = new THREE.Matrix4();
        this.rotationMatrix.extractRotation(this.root.matrix);

        // Apply bullet impulse in the correct direction
        return new THREE.Vector3(0, 0, this.options.velocity * -1).applyMatrix4(this.rotationMatrix);
    }
});
