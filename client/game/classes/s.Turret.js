s.Turret = new Class({
	extend: s.Projectile,

	construct: function(options){
        // Add a collision mesh
        this.addCollisionMesh(new THREE.SphereGeometry(16));

        // Draw the projectile to the screen
        this.geometry = new THREE.SphereGeometry(12,20,20);
        this.material = new THREE.MeshBasicMaterial({color: 'yellow'});
        this.root.add(new THREE.Mesh(this.geometry, this.material, 0.1));

        // Position the projectile relative to the ship
        this.root.position.copy(options.position);
        this.root.rotation.copy(options.rotation);
	}
});
