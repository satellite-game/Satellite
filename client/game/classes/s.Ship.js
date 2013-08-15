s.Ship = new Class({
	extend: s.GameObject,

	construct: function(options){
		// handle parameters
		this.options = options = jQuery.extend({
			position: new THREE.Vector3(0, 0, 0),
			rotation: new THREE.Vector3(0, 0, 0)
		}, options);

		var geometry = s.models[options.shipClass].geometry;
		var materials = s.models[options.shipClass].materials;

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 100);
		// this.root.scale.set(0.5, 0.5, 0.5); // Can't set scale on convex meshes due to https://github.com/chandlerprall/Physijs/issues/60
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);
	},
	init: function(_super) {
		_super.call(this);

		// Just make it rotate, for show
		// this.root.setAngularVelocity(new THREE.Vector3(-Math.PI/8, 0, 0));

		setTimeout(function() {
			var rotation_matrix = new THREE.Matrix4().extractRotation(this.root.matrix);
			var force_vector = new THREE.Vector3(0, 0, -50000).applyMatrix4(rotation_matrix);
			this.root.applyCentralImpulse(force_vector);
			// this.root.applyCentralImpulse(new THREE.Vector3(0, 0, -25000));
		}.bind(this), 500);
	}
});
