s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(10,20,20), new THREE.MeshNormalMaterial());

		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		// this.root.position.x -= 100;
		// this.root.position.z -= 100;

		// this.update = this.update.bind(this);
		// this.game.hook(this.update);
	},

	xupdate: function(delta, time){
		var root = this.thing;
		var rotationMatrix = new THREE.Matrix4();
		rotationMatrix.extractRotation(root.matrix);

		var linearVelocity = root.getLinearVelocity().clone();
		impulse = linearVelocity.clone().negate();
		root.applyCentralImpulse(impulse);

		var forceVector = new THREE.Vector3(0, 0, -100000).applyMatrix4(rotationMatrix);
		root.applyCentralImpulse(forceVector);
	}

});
