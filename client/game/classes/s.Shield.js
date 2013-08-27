s.Shield = new Class({
	extend: s.GameObject,

	construct: function(options){
        this.ship = options.ship;
        var geometry = new THREE.SphereGeometry(50,50,50);
        var material = new THREE.MeshLambertMaterial({
            color: 0x00F2FF,
            ambient: 0xFFFFFF,
            transparent: true,
            opacity: 0.8
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.ship.add(this.mesh);
        this.startTime = null;
	},

    update: function(){
        if(this.startTime === null){
            this.startTime = new Date().getTime();
        }

        var progress = new Date().getTime() - this.startTime;

        if(progress > 1000){
            this.destruct();
            this.ship.remove(this.root);
        }

        if(this.mesh.material.opacity > 0){
            this.mesh.material.opacity -= 0.04;
        }
    }
});
