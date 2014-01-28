s.Bot = new Class( {
  toString: 'Bot',
  extend: s.Ship,

  construct: function( options ) {
    var position = options.position || [-6879, 210, 406];
    var rotation = options.rotation || [0, Math.PI / 2, 0];

    // Generating a new bot with properties
    this.name = options.name || 'bot ' + (++this.game.botCount);
    this.isBot = true;
    
    this.botOptions = {
      rotationSpeed: Math.PI/2,
      pitchSpeed: Math.PI/4,
      yawSpeed: Math.PI/4,
      thrustImpulse: 0,
      brakePower: 0.85,
      velocityFadeFactor: 16,
      rotationFadeFactor: 4
    };

    this.maxDistance = 8000;
    this.minDistance = 1000;

    this.evasiveManeuvers = false;
    this.evade = {};
    this.evade.pitchSign = 1;
    this.evade.yawSign = 1;

    //set a hook on the bot controls.
    //unhook is necessary when bot dies and new bot is created
    //need to refactor when multiple bots on screen
    var hookName = ('control' + this.name).split(' ').join('');
    this[hookName] = this.controlBot.bind(this);

    this.game.hook( this[hookName] );
    // this.game.botHooks = this.controlBot;

    this.lastTime = new Date( ).getTime( );

    //initialize s.Ship
    this.initialize({
      shipClass: options.shipClass,
      position: new THREE.Vector3( position[ 0 ], position[ 1 ], position[ 2 ] ),
      rotation: new THREE.Vector3( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] ),
      alliance: options.alliance
    });


    //CAMERA SETUP COMES AFER INITALIZE SO ROOT IS ALREADY SET UP
    //Create a camera for the bot - used for radial direction mark
    this.camera = new THREE.PerspectiveCamera(35, 1, 1, 300000);

    // Root camera to the bot's position
    this.root.add( this.camera );

    // Setup camera: Cockpit view; COMMENT OUT FOR CHASE CAM
    this.camera.position.set( 0, 0, 0 );
  },

  getEnemyList: function () {
    this.botEnemyList = [];
    this.botEnemyList.push(this.game.player);
    var enemyShips = this.game.enemies._list;
    for (var i = 0; i < enemyShips.length; i++) {
      if (!enemyShips[i].isBot) {
        this.botEnemyList.push(enemyShips[i]);
      }
    }
  },

  getClosestDistance: function () {
    this.closestDistance = null;
    for (i = 0; i < this.botEnemyList.length; i++) {
      var distance = this.root.position.distanceTo(this.botEnemyList[i].root.position);
      if (!this.closestDistance || distance < this.closestDistance) {
        this.closestDistance = distance;
        this.target = this.botEnemyList[i];
      }
    }
  },

  target2d: function () {
    // TARGET HUD MARKING
    var vTarget3D, vTarget2D;
    if ( this.target ) {
      this.target = this.target.root;

      vTarget3D = this.target.position.clone();
      vTarget2D = s.projector.projectVector(vTarget3D, this.camera);
    }
    return vTarget2D;
  },

  dodgeBullet: function(now) {
    var
      yawSpeed     = this.botOptions.yawSpeed,
      pitchSpeed   = this.botOptions.pitchSpeed;

    var thrustScalar = this.botOptions.thrustImpulse/s.config.ship.maxSpeed + 1;

    var yaw  = this.evade.yawSign * yawSpeed / thrustScalar;
    var pitch  = this.evade.pitchSign * pitchSpeed / thrustScalar;
    var roll = 0;

    var vTarget2D = this.target2d();

    var difference = now - this.lastTime;

    //thrust unless at max speed
    if (this.botOptions.thrustImpulse < s.config.ship.maxSpeed){
      this.botOptions.thrustImpulse += difference;
    }

    return  [pitch, yaw, roll, vTarget2D];
  },

  determineDirection: function() {
    var pitch = 0;
    var yaw = 0;
    var roll = 0;

    var
      yawSpeed     = this.botOptions.yawSpeed,
      pitchSpeed   = this.botOptions.pitchSpeed;

    var thrustScalar = this.botOptions.thrustImpulse/s.config.ship.maxSpeed + 1;

    
    var vTarget2D = this.target2d();

    if (vTarget2D.z < 1) {
        //go left; else if go right
        if (vTarget2D.x < -0.15) {
          yaw = yawSpeed / thrustScalar;
        } else if (vTarget2D.x > 0.15) {
          yaw = -1 * yawSpeed / thrustScalar;
        }
        //do down; else if go up
        if (vTarget2D.y < -0.15) {
          pitch = -1*pitchSpeed / thrustScalar;
        } else if (vTarget2D.y > 0.15) {
          pitch  = pitchSpeed / thrustScalar;
        }
      } else {
        //go right; else if go left
        if (vTarget2D.x < 0) {
          yaw = -1* yawSpeed / thrustScalar;
        } else if (vTarget2D.x >= 0) {
          yaw = yawSpeed / thrustScalar;
        }
        //do up; else if go down
        if (vTarget2D.y < 0) {
          pitch = pitchSpeed / thrustScalar;
        } else if (vTarget2D.y > 0) {
          pitch  = -1 * pitchSpeed / thrustScalar;
        }
      }
      return [pitch, yaw, roll, vTarget2D];
  },

  thrustAndBreaks: function(now) {
    var difference = now - this.lastTime;

    var thrust = 0;
    var brakes = 0;

    var  maxDistance = this.maxDistance, minDistance = this.minDistance;

    if (this.closestDistance > maxDistance) {
      thrust = 1;
    }
    else if (this.closestDistance < minDistance) {
      brakes = 1;
    } else {
      var ratio = (this.closestDistance - minDistance) / (maxDistance - minDistance);
      var optimumSpeed = s.config.ship.maxSpeed * ratio;
      if (optimumSpeed < this.botOptions.thrustImpulse) { brakes = 1; }
      if (optimumSpeed > this.botOptions.thrustImpulse) { thrust = 1; }
    }

    if (thrust && this.botOptions.thrustImpulse < s.config.ship.maxSpeed){
      this.botOptions.thrustImpulse += difference;
    }

    if (brakes && this.botOptions.thrustImpulse > 0){
      this.botOptions.thrustImpulse -= difference;
    }
  },

  motionAndPhysics: function(pitch, yaw, roll, vTarget2D) {
    var linearVelocity = this.root.getLinearVelocity().clone();
    var angularVelocity = this.root.getAngularVelocity().clone();
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.extractRotation(this.root.matrix);

    angularVelocity = angularVelocity.clone().divideScalar(this.botOptions.rotationFadeFactor);
    this.root.setAngularVelocity(angularVelocity);

    var newAngularVelocity = new THREE.Vector3(pitch, yaw, roll).applyMatrix4(rotationMatrix).add(angularVelocity);
    this.root.setAngularVelocity(newAngularVelocity);

    var impulse = linearVelocity.clone().negate();
    this.root.applyCentralImpulse(impulse);

    var getForceVector = new THREE.Vector3(0,0, -1*this.botOptions.thrustImpulse).applyMatrix4(rotationMatrix);
    this.root.applyCentralImpulse(getForceVector);
  },

  controlBot: function() {

    //get closest enemy
    this.getEnemyList();
    this.getClosestDistance();

    var now = new Date( ).getTime( );

    var direction;
    if (this.evasiveManeuvers) {
      direction = this.dodgeBullet(now); ///DODGE BULLET LOGIC ///
    } else {
      this.thrustAndBreaks(now); //// THRUST/BREAK LOGIC ////
      direction = this.determineDirection(); // LEFT/RIGHT/UP/DOWN LOGIC //

      //flip yaw and pitch direction for evading bullets
      this.evade.yawSign = this.evade.yawSign * -1;
      this.evade.pitchSign = this.evade.pitchSign * -1;
    }

    var pitch = direction[0], yaw = direction[1], roll = direction[2], vTarget2D = direction[3];

    // MOTION AND PHYSICS LOGIC //
    this.motionAndPhysics(pitch, yaw, roll, vTarget2D);

    this.lastTime = now;

    ///////  FIRING LOGIC ////////
    if (this.game.gameFire && Math.abs(vTarget2D.x) <= 0.15 && Math.abs(vTarget2D.y) <= 0.15 && vTarget2D.z < 1 && this.closestDistance < this.maxDistance) {
      this.fire('turret');
    }

  }

} );