s.Projectile = new Class({
	extend: s.GameObject,

    construct: function(options){
        // handle parameters
        this.color = s.config.weapons.bullets.color[options.team];
        this.velocity = s.config.weapons.bullets.velocity;
        this.initialVelocity = options.initialVelocity;
    },

	init: function(_super){
        _super.call(this);
        this.applyForce();
    },

    addCollisionMesh: function(geometry){
        // Create a physijs mesh for real physics motion and collision detection.
        var material = Physijs.createMaterial(new THREE.MeshBasicMaterial({visible: true, color: 'red'}), 0.8, 0.3);
        var collisionMesh = new Physijs.SphereMesh(geometry, material, 0.1);
        this.root = collisionMesh;        
        this.root.addEventListener('collision', this.handleCollision.bind(this));
    },

    handleCollision: function(mesh){
        var target = mesh.instance.name;
        this.destruct();
    },

    applyForce: function(){
        // Make sure the bullets matrix is up to date
        this.root.updateMatrix();

        // Extract the rotation from the bullets matrix
        this.rotationMatrix = new THREE.Matrix4();
        this.rotationMatrix.extractRotation(this.root.matrix);

        // Apply bullet impulse
        this.forceVector = new THREE.Vector3(0, 0, (this.velocity * -1) + (this.initialVelocity.z > 0 ? this.initialVelocity.z * -1 : this.initialVelocity.z )).applyMatrix4(this.rotationMatrix);
        this.root.applyCentralImpulse(this.forceVector);
    }

});
