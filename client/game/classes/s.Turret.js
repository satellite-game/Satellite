s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(20,16,16), new THREE.MeshNormalMaterial(), 0.05);

		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);
        this.root.creationTime = new Date();
		// this.root.position.x -= 100;
		// this.root.position.z -= 100;

		// this.update = this.update.bind(this);
		// this.game.hook(this.update);
	},

	update: function(delta, time){
		var root = this.root;
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.extractRotation(root.matrix);

		var linearVelocity = root.getLinearVelocity().clone();
		impulse = linearVelocity.clone().negate();
		root.applyCentralImpulse(impulse);

		var forceVector = new THREE.Vector3(0, 0, -10).applyMatrix4(rotationMatrix);
		root.applyCentralImpulse(forceVector);

	}

});
