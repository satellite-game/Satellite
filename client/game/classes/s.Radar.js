s.Radar = new Class({

    construct: function(options){

        this.game = options.game;

        this.radarCanvas = document.createElement( 'canvas' );

        this.radarCanvas.style.position = 'absolute';

        this.radarCanvas.width = 128;
        this.radarCanvas.height = 128;
        this.radarCanvas.style.top = '600px';
        this.radarCanvas.style.left = '600px';
        //this.radarCanvas.style.top = window.innerHeight - this.radarCanvas.height;
        //this.radarCanvas.style.left = window.innerWidth - this.radarCanvas.width;

        this.radarCamera = new THREE.PerspectiveCamera( 20, this.radarCanvas.width / this.radarCanvas.height, 1, 10000 );
        this.radarCamera.position.z = 1800;

        this.radarScene = new THREE.Scene();

        var light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 0, 0, 1 ).normalize();
        this.radarScene.add( light );


        var context = this.radarCanvas.getContext( '2d' );

        var shadowTexture = new THREE.Texture( this.radarCanvas );
        shadowTexture.needsUpdate = true;

        var shadowMaterial = new THREE.MeshBasicMaterial( { map: shadowTexture } );
        var shadowGeo = new THREE.PlaneGeometry( 300, 300, 1, 1 );

        var mesh = new THREE.Mesh( shadowGeo, shadowMaterial );
        mesh.position.x = 400;
        mesh.position.y = -250;
        mesh.rotation.x = -Math.PI / 2;
        this.radarScene.add( mesh );

        var color, f1, f2, f3, p, n, vertexIndex,
            radius = 80,
            geometry = new THREE.SphereGeometry( radius );


        var materials = [

            new THREE.MeshLambertMaterial( {
                color: 0xffffff,
                shading: THREE.FlatShading,
                vertexColors: THREE.VertexColors } ),
            new THREE.MeshBasicMaterial( { color: 0x000000,
                shading: THREE.FlatShading,
                wireframe: true,
                transparent: true } )

        ];

        this.group = THREE.SceneUtils.createMultiMaterialObject( geometry, materials );
        this.group.position.x = -400;
        this.group.rotation.x = -1.87;
        this.radarScene.add( this.group );

        this.radarRenderer = new THREE.WebGLRenderer( { antialias: true } );
        this.radarRenderer.setSize( this.radarCanvas.width, this.radarCanvas.height );

        this.radarCanvas.appendChild( this.radarRenderer.domElement );

        this.update = this.update.bind(this);
        this.game.hook(this.update);

//        document.body.appendChild(this.radarCanvas);


    },

    update: function() {
        //debugger;
        this.render();

    },

    render: function() {

        this.radarCamera.position.x += ( this.radarCamera.position.x ) * 0.05;
        this.radarCamera.position.y += ( this.radarCamera.position.y ) * 0.05;

        this.radarCamera.lookAt( this.radarScene.position );

        this.radarRenderer.render( this.radarScene, this.radarCamera );

    }
});
