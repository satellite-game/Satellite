s.Shield = new Class({
	extend: s.GameObject,

	construct: function(options){
        var geometry = new THREE.SphereGeometry(50,50,50);
        var material = new THREE.MeshLambertMaterial({
            color: 0x00F2FF,
            ambient: 0x00F2FF,
            transparent: true,
            opacity: 0.4
        });
        this.mesh = new THREE.Mesh(geometry, material);
        options.ship.add(this.mesh);
        this.startTime = null;
	},

    update: function(){
        if(this.startTime === null){
            this.startTime = new Date().getTime();
        }

        var progress = new Date().getTime() - this.startTime;

        if(progress > 1000){
            this.destruct();
        }

        if(this.mesh.material.opacity > 0){
            this.mesh.material.opacity -= 0.04;
        }
    },

    destruct: function(_super){
        _super.call(this);
        this.ship.remove(this.root);
    }
});
