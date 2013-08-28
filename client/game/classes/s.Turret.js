s.Turret = new Class({
    toString: 'Turret',

	extend: s.Projectile,

    options: {
        mass: 1,
        size: 25,
        velocity: 5000,
        damage: 1000,
        scale: new THREE.Vector3(50, 50, 1.0),
        color: {
            alliance: 0x00F2FF,
            rebels: 0xFF0000
        }
    },

	construct: function(options){
        // Handle parameters
        this.color = this.options.color[options.team];

        var geometry = new THREE.SphereGeometry(this.options.size);
        var material = Physijs.createMaterial(new THREE.MeshBasicMaterial({visible: false}));
        this.root = new Physijs.SphereMesh(geometry, material, this.options.mass);
        this.root.addEventListener('collision', this.handleCollision.bind(this));

        // Draw the projectile to the screen
        var spriteImg = new THREE.ImageUtils.loadTexture("game/textures/particle.png");
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: spriteImg,
            useScreenCoordinates: false,
            blending: THREE.AdditiveBlending,
            color: this.color
        }));

        sprite.scale.copy(this.options.scale);
        this.root.add(sprite);

        // Position the projectile relative to the ship
        this.root.position.copy(options.position);
        this.root.rotation.copy(options.rotation);
	}
});
