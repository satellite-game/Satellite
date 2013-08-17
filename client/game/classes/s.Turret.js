s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
	
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(10,20,20), new THREE.MeshNormalMaterial());
		
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		this.root.position.x -= 500;
		this.root.position.z -= 500;
	}

});