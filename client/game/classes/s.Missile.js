s.Missile = new Class({
    extend: s.Projectile,

    construct: function(options){

    // handle parameters
    this.color = s.config.weapons.missile.color[options.team];
    this.velocity = s.config.weapons.missile.velocity;

    // Add a collision mesh
    this.addCollisionMesh(new THREE.CylinderGeometry(12, 12, 40));

    // Draw the projectile to the screen
    this.geometry = new THREE.CylinderGeometry(6,6,40);
    this.material = new THREE.MeshBasicMaterial({color: this.color});
    this.root.add(new THREE.Mesh(this.geometry, this.material, 0.1));

    // Position the projectile relative to the ship
    this.root.position.copy(options.position);
    this.root.rotation.copy(options.rotation);
    }
});
