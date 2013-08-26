s.Projectile = new Class({
	extend: s.GameObject,

    construct: function(options){
        // handle parameters
        this.initialVelocity = options.initialVelocity;
        var that = this;
        // Destory projectile after 3 secs
        setTimeout(function(){that.destruct();}, 3000);
    },

	init: function(_super){
        _super.call(this);
        this.applyForce();
    },

    handleCollision: function(mesh, position){
        var target = mesh.instance.name;
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
