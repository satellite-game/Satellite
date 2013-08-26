s.Missile = new Class({
    toString: 'Missile',
    
    extend: s.Projectile,

    options: {
        mass: 1,
        color: {
            alliance: 0x00F2FF,
            rebels: 0xFF0000
        },
        damage: 100,
        velocity: 1000
    },

    construct: function(options) {
        // handle parameters
        this.color = this.options.color[options.team];
        this.velocity = this.options.velocity;

        // Create a cylinder
        var geometry = new THREE.CylinderGeometry(3,3,40);
        var material = new THREE.MeshBasicMaterial({ color: this.color });

        // Rotate the cylinder to face the Z direction
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI/2));
        
        // Create the mesh
        this.root = new Physijs.CylinderMesh(geometry, material, this.options.mass);

        // Position the projectile relative to the ship
        this.root.position.copy(options.position);
        this.root.rotation.copy(options.rotation);
    }
});
