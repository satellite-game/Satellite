s.Explosion = new Class({
	extend: s.GameObject,

	construct: function(options){
		var pGeometry = new THREE.Geometry();
			for(var i = 0; i < 10; i++){
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 20 - 10;
				vertex.y = Math.random() * 20 - 10;
				vertex.z = Math.random() * 20 - 10;
				pGeometry.vertices.push(vertex);
			}

		var pMaterial = new THREE.ParticleBasicMaterial({
			color: 0xFFFFFF,
			size: 300,
			map: THREE.ImageUtils.loadTexture("game/textures/explosion.png"),
			blending: THREE.AdditiveBlending,
			transparent: true
		});

		this.root = new THREE.ParticleSystem(pGeometry, pMaterial);
		this.root.sortParticles = true;
		this.root.position.copy(options.position);

		this.startTime = null;
		this.animationTime = 1000;
	},

	update: function(){
		if(this.startTime === null){
			this.startTime = new Date().getTime();
		}

		var progress = new Date().getTime() - this.startTime;
		var proportionalProgress = progress/this.animationTime;
		var scale = 8 * proportionalProgress;
		this.root.scale.set(scale,scale,scale);
		this.root.material.opacity = 1 - proportionalProgress;

		if(progress > this.animationTime){
			this.hide();
		}
	}
});
