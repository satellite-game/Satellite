s.SatelliteGame = new Class( {
    toString: 'SatelliteGame',
    extend: s.Game,

    // Models that should be loaded
    models: [
        'phobos_hifi',
        'phobos_lofi',
        'human_ship_heavy',
        'human_ship_light',
        'human_space_station',
        'human_building_short',
        'human_building_tall'
    ],

    textures: [
        'particle.png',
        'explosion.png',
        'crosshairs.png'
    ],

    getRandomCoordinate: function(){
        var coefficient = 1;
        if (Math.random() > 0.5){
            coefficient = -1;
        }
        return Math.floor(Math.random()* 15000 + 15000) * coefficient;
    },

    construct: function() {
        this.botCount = 0;

        /******************
         Enemy setup
         ******************/
        this.enemies = {
            _list: [ ],
            _numberOfHumans: 1, //initialize to 1 for yourself
            _numberOfBots: 0,
            _map: {}, // new WeakMap()
            get: function ( nameOrId ) {
                if ( typeof nameOrId == 'string' ) {
                    return this._map[ nameOrId ]; // return enemies._map.get(nameOrId);
                } else if ( typeof nameOrId == 'number' ) {
                    return this._list( nameOrId );
                }
            },
            has: function ( nameOrId ) {
                return !!this.get( nameOrId );
            },
            execute: function ( nameOrId, operation, args ) {
                var enemy = this.get( nameOrId );
                if ( enemy ) {
                    enemy[ operation ].apply( enemy, args );
                    return true;
                }
                return false;
            },
            forEach: function ( callback ) {
                this._list.forEach( callback );
            },
            list: function ( ) {
                return this._list;
            },
            delete: function ( nameOrId ) {
                var enemy = this.get( nameOrId );
                if ( enemy ) {
                    // Remove from map
                    delete this._map[ enemy.name ]; // this._map.delete(enemy.name);

                    // Remove from array
                    var enemyIndex = this._list.indexOf( enemy );
                    if ( ~enemyIndex )
                        this._list.splice( enemyIndex, 1 );

                    // destroy
                    enemy.destruct( );

                    return true;
                }
                return false;
            },
            add: function ( enemyInfo, isBot ) {
                if ( this.has( enemyInfo.name ) ) {
                    this.delete( enemyInfo.name );
                    console.error( 'Bug: Player %s added twice', enemyInfo.name );
                } else {
                    if ( enemyInfo.name === null ) {
                        console.error( 'Bug: enemyInfo contained null player name' );
                        console.log( enemyInfo );
                        console.trace( );
                    }
                    if (!isBot) { console.log( '%s has joined the fray', enemyInfo.name ); }
                }

                // TODO: include velocities?
                var enemyShip;
                if (isBot) {
                    this._numberOfBots++;
                    enemyShip = new s.Bot( {
                        game: s.game,
                        shipClass: 'human_ship_heavy',
                        name: enemyInfo.name,
                        position: enemyInfo.position,
                        rotation: enemyInfo.rotation,
                        alliance: 'rebel'
                    } );
                } else {
                    this._numberOfHumans++;
                    var alliance = 'rebel';
                    if (s.game.teamMode) {
                        alliance = enemyInfo.alliance || 'alliance';
                    }
                    enemyShip = new s.Player( {
                        game: s.game,
                        shipClass: 'human_ship_heavy',
                        name: enemyInfo.name,
                        position: new THREE.Vector3( enemyInfo.pos[ 0 ], enemyInfo.pos[ 1 ], enemyInfo.pos[ 2 ] ),
                        rotation: new THREE.Vector3( enemyInfo.rot[ 0 ], enemyInfo.rot[ 1 ], enemyInfo.rot[ 2 ] ),
                        alliance: alliance
                    } );
                }

                if (isBot) { console.log( '%s has joined the fray', enemyShip.name ); }

                this._list.push( enemyShip );
                this._map[ enemyShip.name ] = enemyShip; // this._map.set(enemyInfo.name, otherShip);
            }
        };

        // Create sound object
        this.sound = new s.Sound({
            enabled: s.config.sound.enabled,
            sounds: s.config.sound.sounds
        });
    },

    initialize: function() {
        var that = this;
        this.IDs = [];

        this.hostPlayer = false;
        this.gameFire = true;

        //teamMode - invasion;, Not teamMode - free-for-all; 
        this.teamMode = true;
        this.startingPosition = [this.getRandomCoordinate(), this.getRandomCoordinate(), this.getRandomCoordinate()];
        this.humansOnly = false;

        this.rechargeShields = s.util.debounce(s.game.shieldBoost,7000);
        // No gravity
        this.scene.setGravity(new THREE.Vector3(0, 0, 0));

        // Ambient light
        this.ambientLight = new THREE.AmbientLight( 0x382828 );
        this.scene.add( this.ambientLight );

        // Directional light
        this.light = new THREE.DirectionalLight( 0xEEEEEE, 2 );
        this.light.position.set( -100000, 0, 0 );
        this.scene.add( this.light );

        // Add moon
        this.moon = new s.Moon( {
            game: this
        } );

        // Add spacestation
        this.spaceStation = new s.SpaceStation( {
            game: this
        } );

        // Add tall moon base
        this.moonBaseTall = new s.MoonBaseTall( {
            game: this
        } );

        this.baseNameMap = {
            'spaceStation': 'Space Base',
            'moonBaseTall': 'Moon Base'
        };

        this.pilot = {};
        this.callsigns = this.callsigns || ["Apollo","Strobe","Sage","Polkadot","Moonglow","Steel","Vanguard","Prong","Uptight","Blackpony","Hawk","Ramrod","Dice","Falcon","Rap","Buckshot","Cobra","Magpie","Warhawk","Boxer","Devil","Hammer","Phantom","Sharkbait","Dusty","Icon","Blade","Pedro","Stinger","Yellow Jacket","Limit","Sabre","Misty","Whiskey","Dice","Antic","Arrow","Auto","Avalon","Bandit","Banshee","Blackjack","Bulldog","Caesar","Cajun","Challenger","Chuggs","Cindy","Cracker","Dagger","Dino","Esso","Express","Fangs","Fighting Freddie","Freight Train","Freemason","Fury","Gamma","Gear","Ghost","Ginger","Greasy","Havoc","Hornet","Husky","Jackal","Jaguar","Jedi","Jazz","Jester","Knife","Kitty Hawk","Knight","Knightrider","Koala","Komono","Lancer","Lexus","Lion","Levi","Lucid","Malty","Mail Truck","Magma","Magnet","Malibu","Medusa","Maul","Monster","Misfit","Moss","Moose","Mustang","Nail","Nasa","Nacho","Nighthawk","Ninja","Neptune","Odin","Occult","Nukem","Ozark","Pagan","Pageboy","Panther","Peachtree","Phenom","Polestar","Punisher","Ram","Rambo","Raider","Raven","Razor","Rupee","Sabre","Rust","Ruin","Sultan","Savor","Scandal","Scorpion","Shooter","Smokey","Sniper","Spartan","Thunder","Titus","Titan","Timber Wolf","Totem","Trump","Venom","Veil","Viper","Weasel","Warthog","Winter","Wiki","Wild","Yonder","Yogi","Yucca","Zeppelin","Zeus","Zesty"];
        this.pilot.name = this.callsigns[Math.floor(this.callsigns.length*Math.random())] + ' ' + ( new Date( ).getTime( ) % 100 );

        // Gamepad interface
        this.gamepad = new Gamepad();

        if (this.oculus.detected) {
            console.log('Activating oculus HUD');
            this.HUD.canvas.style.display = 'none';
            this.HUD.oculusCanvas.style.display = 'block';
        }

        // Add menu
        this.menu = new s.Menu({
            game: this
        });

        // Add a hud
        this.HUD = new s.HUD( {
            game: this
        } );

        this.menu.showStartMenu();

        this.player = new s.Player( {
            HUD: this.HUD,
            game: this,
            shipClass: 'human_ship_heavy',
            position: new THREE.Vector3(this.startingPosition[0], this.startingPosition[1], this.startingPosition[2]),
            name: this.pilot.name,
            rotation: new THREE.Vector3( 0, Math.PI/2, 0 ),
            alliance: 'alliance',
            camera: this.camera
        } );

        // Targeting square around targeted enemy.

        // var targetingGeo = new THREE.PlaneGeometry(100, 100);
        // var targetingMat = new THREE.MeshBasicMaterial({color: 0x00FF00, wireframe: true});

        // this.targeting = new THREE.Mesh(targetingGeo, targetingMat);

        // this.scene.add( this.targeting );

        // this.currentTarget = null;

        this.HUD.hp = this.player.hull;

        $(document).on('keyup', function(evt) {
          if (evt.which === 86 && that.camera.position.equals( new THREE.Vector3(0,0,0) )) {
            that.camera.position.set(0,35,250);
          } else if (evt.which === 86) {
            that.camera.position.set(0,0,0);
          }
        });

        // Planet camera
        // this.scene.add(this.camera);
        // this.camera.position.set(10000,2000,10000);

        // Add skybox
        this.addSkybox( );
        this.addDust( );

        // Fly controls
        this.controls = new s.Controls( {
            game: this,
            player: this.player,
            camera: this.camera,
            HUD: this.HUD,
            menu: this.menu
        } );

        // Dependent on controls; needs to be below s.Controls
        this.radar = new s.Radar( {
            game: this
            //controls: this.controls
        } );

        // window.addEventListener( 'mousemove', function ( e ) {
        //     that.HUD.targetX = e.pageX;
        //     that.HUD.targetY = e.pageY;
        // } );

        window.addEventListener( 'mousedown', function ( ) {
            that.controls.firing = true;
        } );
        window.addEventListener( 'mouseup', function ( ) {
            that.controls.firing = false;
        } );

        // Add this back in later with new targeting system.

        window.addEventListener( 'keydown', function(e) {
            // Cycle through targets; extra logic guarding to prevent rapid cycling while the key is pressed
            e = e.which;
            that.HUD.changeTarget = (e === 69 ? 1 : e === 81 ? -1 : 0);
        } );
        
        this.comm = new s.Comm( {
            room: this.room,
            game: that,
            pilot: that.pilot,
            player: this.player,
            server: window.location.hostname + ':' + window.location.port
        } );

        this.comm.on('fire', that.handleEnemyFire);
        this.comm.on('hit', that.handleHit);
        this.comm.on('player list', that.handlePlayerList);
        this.comm.on('killed', that.handleKill);
        this.comm.on( 'join', that.handleJoin );
        this.comm.on( 'leave', that.handleLeave );
        this.comm.on( 'move', that.handleMove );
        this.comm.on( 'sync', that.handleSync);
        this.comm.on( 'bot retrieval', that.handleBotInfo );
        this.comm.on( 'bot positions', that.handleBotPositions );
        this.comm.on( 'baseHit', that.baseHit );
        this.comm.on( 'baseInfo', that.handleBaseInfo );
        this.comm.on( 'baseShields', that.handleBaseShields );

        this.HUD.controls = this.controls;

        this.handleLoadMessages('initializing physics');
        this.player.root.addEventListener('ready', function(){
            s.game.start();
        });

        // Engine glow and flame trail on your player only.

        this.flames = [];

        for (var i = 0; i < 5; i++) {
          var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: s.textures.particle,
            useScreenCoordinates: false,
            blending: THREE.AdditiveBlending,
            color: 0x00FFFF
          }));

          this.flames.push(sprite);
          this.player.root.add(sprite);
          sprite.position.set(0, 0, (i*10)+40);
        }

        this.trailGlow = new THREE.PointLight(0x00FFFF, 5, 20);
        this.player.root.add( this.trailGlow );
        this.trailGlow.position.set(0, 0, 35);

        this.ocuScale = this.oculus.detected ? 0.2 : 1;
    },


    render: function(_super, time) {
        _super.call(this, time);
        this.controls.update();
        // this.targeting.lookAt(this.player.root.position);
        // if (this.currentTarget) this.targeting.position.set(this.currentTarget.root.position);

        
        // console.log(_vec3.sub(x3, y3).lengthManhattan());

        // Adjusts engine glow based on linear velosity
        this.trailGlow.intensity = this.player.root.getLinearVelocity().length()/100;

        var flameScaler = (Math.random()*0.1 + 1)*this.ocuScale;

        this.flames[0].scale.set(2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler);
        this.flames[1].scale.set(3*this.trailGlow.intensity*flameScaler, 3*this.trailGlow.intensity*flameScaler, 3*this.trailGlow.intensity*flameScaler);
        this.flames[2].scale.set(2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler);
        this.flames[3].scale.set(1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler);
        this.flames[4].scale.set(1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler);
    },

    addSkybox: function() {
        var urlPrefix = "game/textures/skybox/Purple_Nebula_";
        var urls = [
            urlPrefix + "right1.png", urlPrefix + "left2.png",
            urlPrefix + "top3.png", urlPrefix + "bottom4.png",
            urlPrefix + "front5.png", urlPrefix + "back6.png"
        ];

        THREE.ImageUtils.loadTextureCube(urls, {}, function(textureCube) {
            textureCube.format = THREE.RGBFormat;
            var shader = THREE.ShaderLib.cube;

            var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
            uniforms.tCube.value = textureCube;

            var material = new THREE.ShaderMaterial( {
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: uniforms,
                side: THREE.BackSide
            } );

            this.skyboxMesh = new THREE.Mesh( new THREE.CubeGeometry( 200000, 200000, 200000, 1, 1, 1, null, true ), material );
            this.scene.add( this.skyboxMesh );
        }.bind(this));
    },

    addDust: function() {
        var starSprite = THREE.ImageUtils.loadTexture('game/textures/particle.png');
        var geometry = new THREE.Geometry();

        // Set to false for "dust", true for stars
        var outer = true;

        // Spec size
        var radius = 100000;
        var size = 100;
        var count = 1000;

        for (var i = 0; i < count; i ++ ) {

            var vertex = new THREE.Vector3( );

            if ( outer ) {
                // Distribute "stars" on the outer bounds of far space
                vertex.x = Math.random( ) * 2 - 1;
                vertex.y = Math.random( ) * 2 - 1;
                vertex.z = Math.random( ) * 2 - 1;
                vertex.multiplyScalar( radius );
            } else {
                // Distribute "dust" throughout near space
                vertex.x = Math.random( ) * radius - radius / 2;
                vertex.y = Math.random( ) * radius - radius / 2;
                vertex.z = Math.random( ) * radius - radius / 2;
            }

            geometry.vertices.push( vertex );

        }

        var material = new THREE.ParticleBasicMaterial( {
            size: size,
            map: starSprite,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true
        } );

        this.dust = new THREE.ParticleSystem( geometry, material );

        this.scene.add( this.dust );
    },

    handleJoin: function ( message ) {
           s.game.enemies.add( message );
           s.game.addBotOnBotDeathOrJoin();
    },
    handleLeave: function ( message ) {
        if ( s.game.enemies.delete( message.name ) ) {
            console.log( '%s has left', message.name );
            s.game.enemies._numberOfHumans--;
        }
    },

    handleMove: function ( message ) {
        if ( message.name == this.pilot.name ) {
            // server told us to move
            console.log( 'Server reset position' );

            // Return to center
            s.game.player.setPosition( message.pos, message.rot, message.aVeloc, message.lVeloc, false ); // Never interpolate our own movement
        } else {
            // Enemy moved
            if ( !s.game.enemies.execute( message.name, 'setPosition', [ message.pos, message.rot, message.aVeloc, message.lVeloc, message.interp ] ) ) {
                s.game.enemies.add( message );
            }
        }
    },

    handlePlayerList: function(message) {
        for (var otherPlayerName in message) {
            //set up game settings on client
            s.game.humansOnly = message[otherPlayerName].humansOnly;
            s.game.teamMode = message[otherPlayerName].teamMode;
            
            // don't add self
            if (otherPlayerName == this.player.name) {
                s.game.setTeam(message[otherPlayerName]);
                continue;
            }

            var otherPlayer = message[otherPlayerName];
            s.game.enemies.add(otherPlayer);
        }
        s.game.addBotOnBotDeathOrJoin();
    },

    handleKill: function(message) {
        // get enemy position
        var position = s.game.enemies.get(message.killed).root.position;
        new s.Explosion({
            game: this.game,
            position: position
        });
        s.game.enemies.delete(message.killed);
        if (message.killer == s.game.pilot.name) {
            // console.warn('You killed %s!', message.killed);
            s.game.HUD.pushKillList(message.killed, 'You');
        }
        else {
            // console.log('%s was killed by %s', message.killed, message.killer);
            s.game.HUD.pushKillList(message.killed, message.killer);
        }
    },

    handleEnemyFire: function(message) {
        var bulletPosition = message.position;
        var bulletRotation = message.rotation;
        var initialVelocity = message.initialVelocity;

            new s.Turret({
                pilot: message.name,
                game: s.game,
                position: bulletPosition,
                rotation: bulletRotation,
                initialVelocity: initialVelocity,
                team: 'alliance'
            });

    },

    handleHit: function(message) {
        var zapped = message.zappedName;
        var killer = message.killerName;
        var zappedEnemy = s.game.enemies.get(zapped);
        if (zapped === s.game.pilot.name){
            s.game.stopShields();
            s.game.rechargeShields();
            if (s.game.player.shields > 0){
                s.game.HUD.menu.animate({
                    color: s.game.HUD.shields,
                    frames: 30
                });
                s.game.HUD.shieldsFull.animate({
                    color: s.game.HUD.shieldsDamaged,
                    frames: 30
                });
                s.game.player.shields -= 20;
            } else {
                s.game.HUD.menu.animate({
                    color: s.game.HUD.hull,
                    frames: 30
                });
                s.game.player.hull -= 20;
            }
            console.log('You were hit with a laser by %s! Your HP: %d', killer, s.game.player.hull);

            if (s.game.player.hull <= 0) {
                s.game.handleDie(zapped, killer);
            }
        } else {
            if (zappedEnemy.isBot) {
                zappedEnemy.evasiveManeuvers = true;
                setTimeout(function() {
                    zappedEnemy.evasiveManeuvers = false;
                }, 2000);
            }
            if (zappedEnemy.shields > 0){
                zappedEnemy.shields -= 20;
                console.log(zapped, ' shield is now: ', zappedEnemy.shields);
                setTimeout(function() {
                    s.game.replenishEnemyShield(zappedEnemy);
                }, 7000);
            } else {
                zappedEnemy.hull -= 20;
                console.log(zapped, ' hull is now: ', zappedEnemy.hull);
            }
            if (zappedEnemy.hull <= 0 && zappedEnemy.isBot) {
                console.log(zapped, ' has died');
                s.game.handleKill.call(s, { killed: zapped, killer: killer });
                var hookName = ('control' + zapped).split(' ').join('');
                s.game.unhook( zappedEnemy[hookName] );

                s.game.enemies._numberOfBots--;
                setTimeout(function() { s.game.addBotOnBotDeathOrJoin(); }, 6000);
            }
        }
    },

    handleFire: function(props) {
        if (s.game.room) s.game.comm.fire(props.position, props.rotation, props.initialVelocity);
    },

    handleDie: function(you, killer) {
        if (this.hostPlayer) clearInterval(this.botPositionInterval);
        this.menu.gameOver(killer);
        s.game.comm.died(you, killer);

        this.gameFire = false;
        this.hostPlayer = false;
        this.restartGame();
    },

    addBotOnBotDeathOrJoin: function() {
        if (this.humansOnly) { return; }

        var humans = this.enemies._numberOfHumans;
        var bots = this.enemies._numberOfBots;
        if ( this.teamMode) {
        //there should be roughly 50% more bots than humans in team mode
            while (bots < humans + Math.ceil(humans / 2) ) {
                this.enemies.add( {}, 'bot' );
                bots++;
            }
        } else {
        //there should be equal amount of bots to humans in free for all
            while ( bots < humans ) {
                this.enemies.add( {}, 'bot' );
                bots++;
            }
        }
    },

    restartGame: function(type) {
        var that = this;
        setTimeout(function() {
            that.player.shields = s.config.ship.shields;
            that.player.hull = s.config.ship.hull;
            that.player.setPosition(that.startingPosition,[0,0,0],[0,0,0],[0,0,0]);
            if (type === 'base death') {
                that.setBotsOnRestart();
            }
            that.menu.close();
            that.gameOverBoolean = false;
            that.gameFire = true;
        }, 6000);
    },

    setBotsOnRestart: function () {
        for (var i = 0; i < this.enemies._list.length; i++) {
            if (this.enemies._list[i].isBot) {
                this.enemies._list[i].setPosition([-6879, 210, 406],[0,0,0],[0,0,0],[0,0,0]);
            }
        }
    },

    shieldBoost: function(){
        s.game.IDs.push(setInterval(s.game.shieldAnimate,20));
    },
    shieldAnimate: function(){
        if (s.game.player.shields < s.config.ship.shields){
            s.game.player.shields += 1;
        } else {
            s.game.stopShields();
        }
    },
    stopShields: function(){
        for (var i = 0; i < s.game.IDs.length; i++){
            clearInterval(s.game.IDs[i]);
        }
    },

    replenishEnemyShield: function (enemyShip) {
        var replenish = function() {
            if (enemyShip.shields < s.config.ship.shields) {
                enemyShip.shields++;
            } else {
                this.stopEnemyShieldReplenish(enemyShip);
            }
        };
        var that = this;
        enemyShip.IDs = enemyShip.IDs || [];
        enemyShip.IDs.push(setInterval(function() {
            replenish.call(that);
        }, 20));
    },

    stopEnemyShieldReplenish: function (enemyShip) {
        for (var i = 0; i < enemyShip.IDs.length; i++){
            clearInterval(enemyShip.IDs[i]);
        }
    },

    handleLoadMessages: function(message){
        s.game.loadScreen.setMessage(message);
    },

    updatePlayersWithBots: function (fn) {
        var botEnemies = this.getBotEnemies();
        this.comm[fn](botEnemies);
    },

    //this function only gets called if client is the host player
    handleBotInfo: function() {
        if (this.game.humansOnly) { return; }

        var that = this;
        if (!this.game.hostPlayer) {
            //this the first time this function has been called with this client
            this.game.botPositionInterval = setInterval(function() {
                that.game.updatePlayersWithBots('botUpdate');
            }, 1000);
        }
        this.game.hostPlayer = true;
        if (this.game.botCount === 0) {
            // Create a new bot
            this.game.enemies.add( {}, 'bot');
            this.game.enemies.add( {}, 'bot');
        }
        that.game.updatePlayersWithBots('botInfo');
    },

    getBotEnemies: function() {
        var makeArray = function (obj) {
            var result = [];
            result[0] = obj.x;
            result[1] = obj.y;
            result[2] = obj.z;
            return result;
        };

        enemiesSocketInfo = {};
        var enemiesList = this.enemies._list;
        for (var i = 0; i < enemiesList.length; i++) {
            if (enemiesList[i].isBot){
                var root = enemiesList[i].root;

                //if there is a angular and linear velocity fnc, call it. else create a new 3 vector
                var angularVeloc = (root.getAngularVelocity && root.getAngularVelocity()) || new THREE.Vector3();
                var linearVeloc = (root.getLinearVelocity && root.getLinearVelocity()) || new THREE.Vector3();

                enemiesSocketInfo[name] = {
                    position: makeArray(root.position),
                    rotation: makeArray(root.rotation),
                    aVeloc: makeArray(angularVeloc),
                    lVeloc: makeArray(linearVeloc),
                    name: root.name
                };
                enemiesSocketInfo.botCount = this.botCount;
            }
        }
        return enemiesSocketInfo;
    },

    handleBotPositions: function(message) {
        this.game.botCount = message.botCount;
        //if the bot exists...update positions
        //else make new bot with bot information
        for (var bot in message) {
            if ( bot !== 'botCount' && !this.game.enemies.execute( message[bot].name, 'setPosition', [ message[bot].position, message[bot].rotation, message[bot].aVeloc, message[bot].lVeloc, true ] ) ) {
                this.game.enemies.add(message[bot], 'bot');
            }
        }
    },

    baseHit: function(message) {
        this.game[message.baseName].shields--;
        var shields = this.game[message.baseName].shields;
        console.log(this.game.baseNameMap[message.baseName] + ' was hit by ' + message.pilotName + '. Shields at ' + shields);
        if (this.game[message.baseName].shields < 0) {
            this.game.gameFire = false;
            this.game.handleBaseDeath(message.baseName);
        }
    },

    handleBaseDeath: function(base) {

        var explode = function() {
            var baseRoot = s.game[base].root;
            var points = baseRoot._physijs.points;
            var size;
            if (base === 'moonBaseTall') { size = 100; } //only make bigger flames for moon base
            for (var i = 0; i < points.length - 10; i += 10) {
                new s.Explosion({
                    game: s.game,
                    size: size,
                    position: {x: baseRoot.position.x + points[i].x, y: baseRoot.position.y + points[i].y, z: baseRoot.position.z + points[i].z}
                });
            }
        };

        explode();
        setTimeout(explode, 500);
        setTimeout(explode, 1000);


        setTimeout(function() {
            var message;

            s.game.moonBaseTall.shields = s.config.base.shields;
            s.game.spaceStation.shields = s.config.base.shields;

            if (base === 'spaceStation') {
                message = 'rebels win';
            } else {
                message = "alliance wins";
            }
            s.game.gameOverBoolean = true;
            s.game.menu.gameOver('temp', s.game.baseNameMap[base], message);
            s.game.restartGame('base death');
        }, 2500);

    },

    setTeam: function(message) {
        if (!message.teamMode) { return; }
        this.player.alliance = message.alliance;
        var position;
        if (message.alliance === 'rebel') {
            this.startingPosition = [-6879, 210, 406]; //start at moon
            this.player.enemyBase = 'spaceStation';
        } else {
            this.startingPosition = [19232, 19946, 20311]; //start at spacestation
            this.player.enemyBase = 'moonBaseTall';
        }
        this.player.setPosition(this.startingPosition,[0,0,0],[0,0,0],[0,0,0]);
    },

    handleBaseInfo: function() {
        s.game.comm.baseInfo({
            moonBaseTallShields: s.game.moonBaseTall.shields,
            spaceStationShields: s.game.spaceStation.shields
        });
    },

    handleBaseShields: function(message) {
        s.game.moonBaseTall.shields = message.moonBaseTallShields;
        s.game.spaceStation.shields = message.spaceStationShields;
    }

} );
