s.Radar = new Class({
    toString: 'Radar',
    extend: s.Game,

    construct: function(options){

        this.game = options.game;
        var that = this.game;


        /////////////////////
        // SCENE AND INIT  //
        /////////////////////

        // Init THREE Environment
        that.radarScene = new THREE.Scene();
        that.radarCamera = new THREE.PerspectiveCamera( 40, 1, 1, 1000 );
        that.radarRenderer = this.renderer || new THREE.WebGLRenderer({ antialias: true });
        that.radar = '';

        // Append Renderer+Canvas
        that.radarRenderer.setSize( 256, 256 );
        that.radarCanvas = document.body.appendChild( that.radarRenderer.domElement );

        // Styling
        that.radarCanvas.style.position = 'absolute';
        that.radarCanvas.style.top = '0px';
        that.radarCanvas.style.right = window.innerWidth;

        // Init Camera
        that.radarCamera.position.x = 0;
        that.radarCamera.position.y = 0;
        that.radarCamera.position.z = 180;
        that.radarScene.add( that.radarCamera );

        // Init Lights
        var light = new THREE.DirectionalLight( 0x000000 );
        light.position.set( 0, 1, 1 ).normalize();
        that.radarScene.add( light );

        that.radarRenderer.setClearColor( 0x212121, 1 );


        ///////////////////////////////
        //  RADAR SPHERE PROPERTIES  //
        ///////////////////////////////

        that.radius = 60;

        var mesh = new THREE.MeshNormalMaterial(),
            sphere = new THREE.SphereGeometry( that.radius, that.radius, that.radius );

        var materials = [
            //new THREE.MeshLambertMaterial( { color: 0xcccccc, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
            new THREE.MeshBasicMaterial( { color: 0x333333, shading: THREE.FlatShading, wireframe: true, transparent: true } )
        ];

        var group = THREE.SceneUtils.createMultiMaterialObject( sphere, materials );
        group.position.x = 0;
        group.position.y = 0;
        group.position.z = 0;
        group.rotation.x = -1.87;
        that.radarScene.add( group );


        ////////////////////////
        //  PLAYER LOCATIONS  //
        ////////////////////////


        var selfMarker = new THREE.Mesh(
            new THREE.SphereGeometry(2),
            new THREE.MeshBasicMaterial( { color: 0x123456, shading: THREE.FlatShading } ) );

        selfMarker.name = "self";
        //selfMarker.position = new THREE.Vector3(10,10,10);

        that.radarScene.add( selfMarker );

        var moonMarker = new THREE.Mesh(
            new THREE.SphereGeometry(10),
            new THREE.MeshBasicMaterial( { color: 0x994411, shading: THREE.FlatShading } ) );

        moonMarker.name = "moon";

        that.radarScene.add( moonMarker );
//        var particleMaterial = new THREE.ParticleBasicMaterial({
//            color:0xffffff,
//            size: 10,
//            blending: THREE.AdditiveBlending,
//            transparent:true
//        });
//        var pX = Math.random() * 100 - 50;
//        var pY = Math.random() * 100 - 50;
//        var pZ = Math.random() * 100 - 50;
//        var particle = new THREE.Particle();
//
//        particle.velocity = new THREE.Vector3(1,0,0);
//        particleGeometry.vertices.push(particle);
//
//        var particleSystem = new THREE.ParticleSystem(particleGeometry, particleMaterial);
//        particleSystem.sortParticles = true;
//        that.radarScene.add(particleSystem);


        that.radarRenderer.render( that.radarScene, that.radarCamera );

    },

});
