s.Projectile = new Class({
	extend: s.GameObject,

    construct: function(options){
        this.HUD = options.HUD;
        this.game = options.game;
        this.comm = this.game.comm;
        this.game = options.game;
        this.pilot = options.pilot;
        // handle parameters
        this.initialVelocity = options.initialVelocity;
        var that = this;
        // Destory projectile after 4 secs
        setTimeout(function(){that.destruct();}, 4000);
    },

	init: function(_super){
        _super.call(this);
        this.applyForce();
    },

    handleCollision: function(mesh, position){
        if (this.pilot === this.game.pilot.name){
            if (mesh.instance.alliance && mesh.instance.alliance === "enemy"){
                this.HUD.menu.animate({
                color: this.HUD.hit,
                frames: 30
                });
                new s.Shield({
                    game: this.game,
                    ship: mesh
                });
                this.comm.hit(mesh.name,this.game.pilot.name);
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
