s.Moon = new Class({
	extend: s.GameObject,

	construct: function(options){
		// handle parameters
		this.options = options = jQuery.extend({
			position: new THREE.Vector3(0, 0, 0),
			rotation: new THREE.Vector3(0, 0, 0)
		}, options);

		var geometry = s.models.phobos_large_hifi.geometry;
		var materials = s.models.phobos_large_hifi.materials;

		// Make the moon a bit red
		materials[0].color.setHex(0x704030); 

		// Setup physical properties
		materials[0] = Physijs.createMaterial(
			materials[0],
			1, // high friction
			0.4 // low restitution
		);

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 0);
		// this.root.scale.set(2, 2, 2); // Can't set scale on convex meshes due to https://github.com/chandlerprall/Physijs/issues/60
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);
		// this.root.receiveShadow = true; // Causes shader error
	}
});
