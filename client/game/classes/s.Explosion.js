s.Explosion = new Class({
	extend: s.GameObject,

	construct: function(options){
		var pGeometry = new THREE.Geometry();
			for(var i = 0; i < 10; i++){
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 50 - 25;
				vertex.y = Math.random() * 50 - 25;
				vertex.z = Math.random() * 50 - 25;
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
		this.animationTime = 500;
	},

	update: function(){
		if(this.startTime === null){ 
			this.startTime = new Date().getTime();
		}

		var progress = new Date().getTime() - this.startTime; 
		var proportionalProgress = progress/this.animationTime;
		var scale = 15 * proportionalProgress; 
		this.root.scale.set(scale,scale,scale);
		this.root.material.opacity = 1 - proportionalProgress;
		// renderer.render(scene, camera);

		if(progress > this.animationTime){
			this.destruct();
		}
	}
});