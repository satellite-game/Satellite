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
        that.radarCanvas.style.left = window.innerWidth-256+"px";

        // Init Camera
        that.radarCamera.position.x = 0;
        that.radarCamera.position.y = 0;
        that.radarCamera.position.z = 180;
        that.radarScene.add( that.radarCamera );

        // Init Lights
        var light = new THREE.DirectionalLight( 0x000000 );
        light.position.set( 0, 1, 1 ).normalize();
        that.radarScene.add( light );

        that.radarScene.tempLog = [];


        ///////////////////////////////
        //  RADAR SPHERE PROPERTIES  //
        ///////////////////////////////

        that.radius = 60;

        var mesh = new THREE.MeshNormalMaterial(),
            sphere = new THREE.SphereGeometry( that.radius, 16, 16 );

        var materials = [
            //new THREE.MeshLambertMaterial( { color: 0xcccccc, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } ),
            new THREE.MeshBasicMaterial( { color:0x5dfc0a, shading: THREE.FlatShading, wireframe: true, transparent: true } )
        ];

        var radar = THREE.SceneUtils.createMultiMaterialObject( sphere, materials );
        radar.position.x = 0;
        radar.position.y = 0;
        radar.position.z = 0;
        radar.rotation.y = -Math.PI/4;

        radar.name = "radar";
        that.radarScene.add( radar );


        ///////////////////////
        //  PLAYER LOCATION  //
        ///////////////////////

        // marker for player position
        var selfMarker = new THREE.Mesh(
            new THREE.TetrahedronGeometry(3),
            new THREE.MeshBasicMaterial( { color: 0xffffff, shading: THREE.FlatShading } ) );

        selfMarker.name = "self";

        radar.add( selfMarker );


        // marker for player motion
        var trajectoryGeo = new THREE.Geometry();
        trajectoryGeo.vertices.push(new THREE.Vector3(0,0,0));
        trajectoryGeo.vertices.push(new THREE.Vector3(0,0,0));

        var selfTrajectory = new THREE.Line(
            trajectoryGeo,
            new THREE.LineBasicMaterial( { color: 0xffffff } ),
            THREE.LineStrip
        );
        selfTrajectory.name = "selfTrajectory";

        selfMarker.add( selfTrajectory );


        /////////////////
        // ALLY MARKER //
        /////////////////



        //////////////////
        // ENEMY MARKER //
        //////////////////



        /////////////////
        // MOON MARKER //
        /////////////////

        // moon instantiation
        var moonGeo = s.models.phobos_lofi.geometry;
        var moonMats = s.models.phobos_lofi.materials;
        moonMats[0].color.setHex(0x704030);
        var moonMarker = new THREE.Mesh( moonGeo, new THREE.MeshNormalMaterial(moonMats) );

        // Moon marker size scaling
        /* TODO: scale in a more meaningful way */
        moonMarker.scale.multiplyScalar(0.005);
        moonMarker.name = "moon";

        // Moon radar positioning
        var moonPosition = that.scene.getChildByName( 'moon' ).position.clone();
        moonMarker.position = moonPosition.normalize().multiplyScalar(that.radius);

        radar.add( moonMarker );



        // Move radar on screen resize
        var context = this;
        $(window).on('resize', context.fitWindow.bind(that));
        context.fitWindow();
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
        //
        //

        // Trigger render loop and assign bindings
        this.update = this.update.bind(that);
        that.hook(this.update);
        that.radarRenderer.render( that.radarScene, that.radarCamera );

    },

    fitWindow: function(){
        s.game.radarCanvas.style.left = window.innerWidth-256+"px";
    },

    update: function(options){

        ///////////////////////
        // RADAR RENDER LOOP //
        ///////////////////////

        var radar      = this.radarScene.getChildByName( 'radar' ),
            self       = radar.getChildByName( 'self' ),
            moon       = radar.getChildByName( 'moon' ),
            trajectory = self.getChildByName( 'selfTrajectory'),
            allies     = radar.getChildByName( 'allies' ),
            enemies    = radar.getChildByName( 'enemies' );


        ////////////////////
        // RADAR ROTATION //
        ////////////////////

        // Clone of the current player's position
        this.selfPosition = this.player.root.position.clone();

        // Radar sphere rotation with respect to player's current rotation
        var now = this.selfPosition.clone();
        var last = this.lastPosition || now;

        // xz dot product parameters
        var top = last.x*now.x + last.z*now.z;
        var bot1 = Math.sqrt( last.x*last.x + last.z*last.z );
        var bot2 = Math.sqrt(  now.x*now.x  +  now.z*now.z );

        var findTheta = top/(bot1*bot2);

        // Javascript is a floating point failbus.
        //radar.rotation.y += findTheta>1 || findTheta<-1 ? Math.acos( Math.round( findTheta ) ) : Math.acos( findTheta );

        this.lastPosition = this.selfPosition.clone();

        ////////////////////////////////
        // SELF POSITION AND ROTATION //
        ////////////////////////////////

        // Rotation of player indicator
//        self.rotation = this.player.root.rotation;

        // Distance from center of the map, scaled logarithmically
        var selfLength   = this.player.root.position.length();
        selfLength = Math.log( selfLength ) - 7 || 0.1;

        // Apply normalization and multiplier to cover full sphere coordinates and set the position
        self.position = this.selfPosition.normalize().multiplyScalar(selfLength*(this.radius/4));

        // Player trajectory marker; scales with velocity, and is never shorter than length 3
        var playerTrajectory = this.player.root.getLinearVelocity().clone().multiplyScalar(1/80);
        playerTrajectory = playerTrajectory.length()>3 ? playerTrajectory : playerTrajectory.normalize().multiplyScalar(3);

        // Set the second line vertex
        trajectory.geometry.vertices[1] = trajectory.geometry.vertices[0].clone().add( playerTrajectory );
        trajectory.geometry.verticesNeedUpdate = true;

        ////////////////////////////////
        // ALLY POSITION AND ROTATION //
        ////////////////////////////////

//        for (var i = 0, len = allies.children.length; i < len; i++){
//            allies.children[i].rotation = '';
//
//            // Distance from center of the map, scaled logarithmically
//            var selfLength   = //allies.children[i].position.length();
//            selfLength = Math.log( selfLength ) - 7 || 0.1;
//
//            // Apply normalization and multiplier to cover full sphere coordinates and set the position
//            self.position = this.selfPosition.normalize().multiplyScalar(selfLength*(this.radius/4));
//
//            // Player trajectory marker; scales with velocity, and is never shorter than length 3
//            var playerTrajectory = this.player.root.getLinearVelocity().clone().multiplyScalar(1/80);
//            playerTrajectory = playerTrajectory.length()>3 ? playerTrajectory : playerTrajectory.normalize().multiplyScalar(3);
//
//            // Set the second line vertex
//            trajectory.geometry.vertices[1] = trajectory.geometry.vertices[0].clone().add( playerTrajectory );
//            trajectory.geometry.verticesNeedUpdate = true;
//
//        }
    }
});
