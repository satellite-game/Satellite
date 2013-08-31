s.Radar = new Class({
    toString: 'Radar',
    extend: s.Game,

    construct: function(options){
        var color = options.color;

        var colorR = color.r.toString(16);
        var colorG = color.g.toString(16);
        var colorB = color.b.toString(16);

        if (colorR === "0"){
            colorR = "00";
        }
        if (colorG === "0"){
            colorG = "00";
        }
        if (colorB === "0"){
            colorB = "00";
        }


        var colorVector = "0x" + colorR + colorG + colorB;

        var colorHex = parseInt(colorVector, 16);

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
            new THREE.MeshBasicMaterial( { color: colorHex, shading: THREE.FlatShading, wireframe: true, transparent: true } )
        ];

        var radar = THREE.SceneUtils.createMultiMaterialObject( sphere, materials );
        radar.position.x = 0;
        radar.position.y = 0;
        radar.position.z = 0;
        //radar.rotation.y = -Math.PI/4;

        radar.name = "radar";
        that.radarScene.add( radar );


        ///////////////////////
        //  PLAYER LOCATION  //
        ///////////////////////

        var selfGeo = new THREE.TetrahedronGeometry(5);
        selfGeo.faces[0].color.setHex(0x330066);
        selfGeo.faces[1].color.setHex(0x003366);
        selfGeo.faces[2].color.setHex(0x336666);
        selfGeo.faces[3].color.setHex(0x000000);
        //selfGeo.colorsNeedUpdate = true;

        // marker for player position
        var selfMarker = new THREE.Mesh(
            selfGeo,
            new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors } ) );

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

        radar.add( selfTrajectory );

        ///////////////////
        // ENEMY MARKERS //
        ///////////////////
        var enemyGeo = [], enemyMarker = [];
        radar.enemyCount = 0;
        for (var i = 0, len = that.enemies.list().length; i < len; i++){

            enemyGeo[i] = new THREE.TetrahedronGeometry(5);

            // marker for player position
            enemyMarker[i] = new THREE.Mesh(
                enemyGeo[i],
                new THREE.MeshBasicMaterial( { color: 0xff0000, shading: THREE.FlatShading } ) );

            enemyMarker[i].name = "enemy"+i;
            enemyMarker[i].hash = that.enemies.list()[i].name;
            radar.add( enemyMarker[i] );

            radar.enemyCount = i+1;

        }

        /////////////////
        // MOON MARKER //
        /////////////////

        // moon instantiation
        var moonGeo = s.models.phobos_lofi.geometry;
        var moonMarker = new THREE.Mesh( moonGeo, new THREE.MeshNormalMaterial() );

        // Moon marker size scaling
        /* TODO: scale in a more meaningful way */
        moonMarker.scale.multiplyScalar(3/1000);
        moonMarker.name = "moon";

        // Moon radar positioning
        var moonPosition = that.scene.getChildByName( 'moon' ).position.clone();
        moonMarker.position = moonPosition.normalize().multiplyScalar(that.radius);

        radar.add( moonMarker );



        // Move radar on screen resize
        var context = this;
        $(window).on('resize', context.fitWindow.bind(that));
        context.fitWindow();

        // Trigger render loop and assign bindings
        this.update = this.update.bind(that);
        that.hook(this.update);
        that.radarRenderer.render( that.radarScene, that.radarCamera );

    },

    fitWindow: function(){
        s.game.radarCanvas.style.left = window.innerWidth-256+"px";
    },

    update: function(options){

        /////////////////////////
        // 3JS SCENE SELECTORS //
        /////////////////////////

        var radar       = this.radarScene.getChildByName( 'radar' ),
            self        = radar.getChildByName( 'self' ),
            moon        = radar.getChildByName( 'moon' ),
            trajectory  = radar.getChildByName( 'selfTrajectory'),
            allies      = radar.getChildByName( 'allies' ),
            enemies     = this.enemies.list(),
            radarRadius = this.radius/ 5,
            that        = s.game;


        ////////////////////
        // RADAR ROTATION //
        ////////////////////

        // Clone of the current player's position
        this.selfPosition = this.player.root.position.clone();

        // Rotate player tetrahedron in accordance with ship rotation
        self.rotation = this.player.root.rotation;

        // Radar sphere rotation with respect to player's current rotation
        var now  = this.selfPosition.clone();
        var last = this.lastPosition || now;

        // xz dot product parameters; partial dot product
        var top  = last.x*now.x + last.z*now.z;
        var bot1 = Math.sqrt( last.x*last.x + last.z*last.z );
        var bot2 = Math.sqrt(  now.x*now.x  +  now.z*now.z );

        var findTheta = top/(bot1*bot2);

        // Calculate angle of rotation; Javascript is a floating point failbus.
        radar.rotation.y += findTheta>1 || findTheta<-1 ? Math.acos( Math.round( findTheta ) ) : Math.acos( findTheta );

        this.lastPosition = this.selfPosition.clone();


        ///////////////////////
        // SELF RADAR MARKER //
        ///////////////////////

        // Distance from center of the map, scaled logarithmically
        var selfLength   = this.player.root.position.length();
        selfLength = Math.log( selfLength ) - 4 || 0.1;

        // Apply normalization and multiplier to cover full sphere coordinates and set the position
        self.position = this.selfPosition.normalize().multiplyScalar(selfLength*(radarRadius));

        // Player trajectory marker; scales with velocity, and is never shorter than length 3
        var playerTrajectory = this.player.root.getLinearVelocity().clone().multiplyScalar(1/80);
        playerTrajectory = playerTrajectory.length()>3 ? playerTrajectory : playerTrajectory.normalize().multiplyScalar(3);

        // Set the second line vertex
        trajectory.geometry.vertices[0] = self.position.clone();
        trajectory.geometry.vertices[1] = trajectory.geometry.vertices[0].clone().add( playerTrajectory );
        trajectory.geometry.verticesNeedUpdate = true;


        /////////////////////////
        // ENEMY RADAR MARKERS //
        /////////////////////////

        var enemyLength = [], enemyPosition = [];

        // ENEMY RADAR ADDITION
        // Search for new enemies and add them to the map
        if (enemies.length > radar.enemyCount){
            for (var j = 0, lenj = enemies.length; j < lenj; j++){
                if (!radar.getChildByName('enemy'+j)){
                    var enemyGeo = new THREE.TetrahedronGeometry(5);

                    // marker for player position
                    var enemyMarker = new THREE.Mesh(
                        enemyGeo,
                        new THREE.MeshBasicMaterial( { color: 0xff0000, shading: THREE.FlatShading } ) );

                    enemyMarker.name = "enemy"+j;
                    radar.add( enemyMarker );

                    radar.enemyCount = j+1;
                }
            }

        // ENEMY RADAR REMOVAL
        // Iterate through the radar population, if a radar marker's associated enemy object is not found,
        // remove the marker, reassign radar marker names, decrement enemy count
        } else if ( enemies.length < radar.enemyCount ) {
            for ( var k = 0, lenk = radar.enemyCount; k < lenk; k++ ) {
                var target = radar.getChildByName('enemy'+k);

                // if the the enemy object no longer exists
                if ( !s.game.enemies.get(target.hash) ){
                    radar.remove( target );
                    radar.enemyCount--; //decrement enemy count. safe to do here since lenk is limit
                    if (lenk === radar.enemyCount) // REMOVE THIS; possibly need to increment lenk
                        console.log(lenk, " ", radar.enemyCount);
                    continue;
                }
                // if the list index of the enemy is not the list index of the radar marker, realign enemy names
                if ( s.game.enemies.list().indexOf(target.hash) !== k ){
                    target.name = 'enemy'+(k-1);
                }
            }
        }

        // ENEMY RADAR POSITION UPDATE
        for (var i = 0, len = enemies.length; i < len; i++){

            enemyPosition[i] = enemies[i].root.position.clone();

            // Distance from center of the map, scaled logarithmically
            enemyLength[i] = enemyPosition[i].clone().length();
            enemyLength[i] = Math.log( enemyLength[i] ) - 4 || 0.1;

            // Apply normalization and multiplier to cover full sphere coordinates and set the position
            if ( radar.getChildByName('enemy'+i) )
                radar.getChildByName('enemy'+i).position = enemyPosition[i].normalize().multiplyScalar(enemyLength[i]*(radarRadius));


        }
    }
});

