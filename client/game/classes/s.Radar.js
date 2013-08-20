s.Radar = new Class({
    toString: 'Radar',
    extend: s.Game,

    construct: function(options){

        this.game = options.game;
        var that = this.game;

        // Init THREE Environment
        that.radarScene = new THREE.Scene();
        that.radarCamera = new THREE.PerspectiveCamera( 40, 1, 1, 1000 );
        that.radarRenderer = this.renderer || new THREE.WebGLRenderer();
        that.radar = '';

        // Append Renderer+Canvas
        that.radarRenderer.setSize( 256, 256 );
        that.radarCanvas = document.body.appendChild( that.radarRenderer.domElement );

        // Styling
        that.radarCanvas.style.position = 'absolute';
        that.radarCanvas.style.top = '700px';
        that.radarCanvas.style.left = '10px';


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

        var radius = 32,
            mesh = new THREE.MeshNormalMaterial(),
            sphere = new THREE.Mesh(new THREE.SphereGeometry( radius, 70, 70 ), mesh),
            geometry = new THREE.SphereGeometry( radius, 70, 70 );
        that.radarScene.add( sphere );

//        var materials = [
//
//            new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
//            new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
//
//        ];
//
//        var group = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
//        group.position.x = 0;
//        group.position.y = 0;
//        group.position.z = 0;
//        group.rotation.x = -1.87;
//        that.radarScene.add( group );
        that.radarRenderer.render( that.radarScene, that.radarCamera );
    },

});
