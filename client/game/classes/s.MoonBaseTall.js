s.MoonBaseTall = new Class({
	extend: s.GameObject,

	construct: function(options){
		// handle parameters
		this.options = options = jQuery.extend({
			position: new THREE.Vector3(-6516.61181640625, 334.5599060058594, -99.58238220214844),
			rotation: new THREE.Vector3(0,-0.25,1.45)
		}, options);

		var geometry = s.models.human_building_tall.geometry;
		var materials = s.models.human_building_tall.materials;

		// Setup physical properties
		materials[0] = Physijs.createMaterial(
			materials[0],
			1, // high friction
			0.4 // low restitution
		);

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 0);

    this.root.name = "moon_base_tall";
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		// this.root.receiveShadow = true; // Causes shader error
	}
});
