s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(20,16,16), new THREE.MeshNormalMaterial(), 1);

		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);
	},

	init: function(_super){
        _super.call(this);

		var root = this.root;

        // Make sure the bullets matrix is up to date
        root.updateMatrix();

        // Extract the rotation from the bullets matrix
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.extractRotation(root.matrix);

        this.forceVector = new THREE.Vector3(0, 0, -100).applyMatrix4(rotationMatrix);

		root.applyCentralImpulse(this.forceVector);
	}

});
