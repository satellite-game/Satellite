s.SpaceStation = new Class({
	extend: s.GameObject,

	construct: function(options){
		// handle parameters
		this.options = options = jQuery.extend({
			position: new THREE.Vector3(20000, 20000, 20000),
			rotation: new THREE.Vector3(0, 0, 0)
		}, options);

		var geometry = s.models.human_space_station.geometry;
		var materials = s.models.human_space_station.materials;

		// Setup physical properties
		materials[0] = Physijs.createMaterial(
			materials[0],
			1, // high friction
			0.4 // low restitution
		);

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 0);

    this.root.name = "space_station";
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);
		// this.root.receiveShadow = true; // Causes shader error
	}
});
