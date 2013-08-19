s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(20,16,16), new THREE.MeshNormalMaterial(), 1);

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
        this.forceVector = new THREE.Vector3(0, 0, -4000 + (this.iv.z>0 ? this.iv.z*-1 : this.iv.z )).applyMatrix4(this.rotationMatrix);
		this.root.applyCentralImpulse(this.forceVector);
	}

});
