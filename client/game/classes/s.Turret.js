s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
        var material = Physijs.createMaterial(
            new THREE.MeshBasicMaterial({color:'blue', transparent: true}),
            0.8,
            0.3
        );
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(3,4,4), material, 1);
        this.root.instance = this;
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);
        this.initialVelocity = options.initialVelocity;
	},

	init: function(_super){
        _super.call(this);

        // Make sure the bullets matrix is up to date
        this.root.updateMatrix();

        // Extract the rotation from the bullets matrix
		this.rotationMatrix = new THREE.Matrix4();
		this.rotationMatrix.extractRotation(this.root.matrix);

        // Apply bullet impulse

        this.forceVector = new THREE.Vector3(0, 0, -8000 + (this.initialVelocity.z>0 ? this.initialVelocity.z*-1 : this.initialVelocity.z )).applyMatrix4(this.rotationMatrix);
		this.root.applyCentralImpulse(this.forceVector);
        this.root.addEventListener('collision', this.handleCollision.bind(this));
    },

    handleCollision: function(){
        this.destruct();
    }

});
