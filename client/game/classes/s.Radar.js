s.Radar = new Class({

    construct: function(options){

        // Init THREE Environment
        this.radarScene = new THREE.Scene();
        this.radarCamera = new THREE.PerspectiveCamera( 40, 1, 1, 1000 );
        this.radarRenderer = new THREE.WebGLRenderer( { antialias: true } );
        this.radar = '';

        // Append Renderer+Canvas
        this.radarRenderer.setSize( 256, 256 );
        this.radarCanvas = document.body.appendChild( this.radarRenderer.domElement );

        this.game = options.game;
        this.controls = options.controls;

        // Styling
        this.radarCanvas.style.position = 'absolute';
        this.radarCanvas.style.top = '800px';
        this.radarCanvas.style.left = '10px';


        // Init Camera
        this.radarCamera.position.x = 0;
        this.radarCamera.position.y = 0;
        this.radarCamera.position.z = 180;
        this.radarScene.add( this.radarCamera );

        // Init Lights
        var light = new THREE.DirectionalLight( 0x000000 );
        light.position.set( 0, 1, 1 ).normalize();
        this.radarScene.add( light );

        this.radarRenderer.setClearColor( 0x212121, 1 );

        var radius = 32,
            mesh = new THREE.MeshNormalMaterial(),
            sphere = new THREE.Mesh(new THREE.SphereGeometry( radius, 70, 70 ), mesh),
            geometry = new THREE.SphereGeometry( radius, 70, 70 );
        this.radarScene.add( sphere );

//        var materials = [
//
//            new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
//            new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true } )
//
//        ];

        //var group = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
//        group.position.x = 0;
//        group.position.y = 0;
//        group.position.z = 0;
//        group.rotation.x = -1.87;
//        this.radarScene.add( group );

//        this.update = this.update.bind(this);
//        this.game.hook(this.update);

        this.radarRenderer.render( this.radarScene, this.radarCamera );

        this.render = this.render.bind(this);
        this.game.hook(this.render);
        this.render();
    },

    update: function() {
        debugger;
        this.render();

    },

    render: function() {

        this.radarCamera.position.x += ( this.radarCamera.position.x ) * 0.05;
        this.radarCamera.position.y += ( this.radarCamera.position.y ) * 0.05;

        this.radarCamera.lookAt( this.radarScene.position );

        requestAnimationFrame(this.render);
        this.controls.update();
        this.radarRenderer.render( this.radarScene, this.radarCamera );

    }
});
