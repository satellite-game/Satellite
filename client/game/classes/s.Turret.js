s.Turret = new Class({
	extend: s.Projectile,

	construct: function(options){
        // Handle parameters
        this.color = s.config.weapons.turret.color[options.team];
        this.velocity = s.config.weapons.turret.velocity;

        // Add a collision mesh
        this.addCollisionMesh(new THREE.SphereGeometry(16));

        // Draw the projectile to the screen
        var spriteImg = new THREE.ImageUtils.loadTexture("game/textures/particle.png");
        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: spriteImg,
            useScreenCoordinates: false,
            blending: THREE.AdditiveBlending,
            color: this.color
        }));
        // sprite.position.set(10,10,0);
        sprite.scale.set(50,50,1.0);
        this.root.add(sprite);

        // add point lights
        var pointLight = new THREE.SpotLight(0xffffff);
        this.root.add(pointLight);

        // Position the projectile relative to the ship
        this.root.position.copy(options.position);
        this.root.rotation.copy(options.rotation);
	}
});
