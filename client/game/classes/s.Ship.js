s.Ship = new Class({
	extend: s.GameObject,

	construct: function(options) {

		// handle parameters
		this.options = options = jQuery.extend({
			position: new THREE.Vector3(0, 0, 0),
			rotation: new THREE.Vector3(0, 0, 0)
		}, options);

		var geometry = s.models[options.shipClass].geometry;
		var materials = s.models[options.shipClass].materials;

		this.root = new Physijs.ConvexMesh(geometry, new THREE.MeshFaceMaterial(materials), 100);
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		this.lastTime = 0;

		this.bulletOffset = new THREE.Vector3(0, 0, -200);
	},

	getEulerRotation: function() {

		// Update the matrix
		this.root.updateMatrix();

		// Extract just the rotation from the matrix
		var rotation_matrix = new THREE.Matrix4();
		rotation_matrix.extractRotation(this.root.matrix);

		// Convert the rotation to euler coordinates with the proper order
		var rotation = new THREE.Vector3();
		rotation.setEulerFromRotationMatrix(rotation_matrix, 'XZY');

		this.root.eulerRotation = rotation;

		// Store position of bullet relative to the world
		return this.bulletOffset.clone().applyMatrix4(this.root.matrixWorld);
	},

	fire: function(){

		var now = new Date().getTime();
		if( now - this.lastTime > 200){
			// fire
			new s.Turret({
				game: this.options.game,
				position: this.getEulerRotation(),
				rotation: this.root.rotation.clone()
			});
			this.lastTime = now;
		}

	}
});
