s.Turret = new Class({
	extend: s.GameObject,

	construct: function(options){
	
		this.root = new Physijs.SphereMesh(new THREE.SphereGeometry(10,20,20), new THREE.MeshNormalMaterial());
		
		this.root.position.copy(options.position);
		this.root.rotation.copy(options.rotation);

		this.root.position.x -= 500;
		this.root.position.z -= 500;

		this.update = this.update.bind(this);
		this.game.hook(this.update);
	},

	update: function(delta, time){
		this.root.position.x -= this.root.position.x *= 0.001;
		this.root.position.z -= this.root.position.z *= 0.001;
	}

});