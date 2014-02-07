s.Controls = new Class({

  toString: 'Controls',

  options: {

    rotationSpeed: Math.PI/2,
    pitchSpeed: Math.PI/4,
    yawSpeed: Math.PI/4,
    thrustImpulse: 0,
    brakePower: 0.85,
    velocityFadeFactor: 16,
    rotationFadeFactor: 4,
    boundaryPushback: 0

  },

  construct: function( options ) {

    // Store references to game objects
    this.HUD = options.HUD;
    this.game = options.game;
    this.player = options.player;
    this.camera = options.camera;
    this.menu = options.menu;
    this.gamepad = options.game.gamepad;
    this.slowControllerScroll = true;

    // Create interpreters for controllers
    this.keyboard = new s.Keyboard();

    // Oculus Rift interface
    this.oculus = this.game.oculus;

    // Mouse interface - mice options are: 'keyboard', 'none', 'oculus'
    // this.mouse = new s.Mouse('keyboard', options);
    this.mouse = new s.Mouse('none', options);

    console.log('Initialized gamepad...');

    this.gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
      console.log('Gamepad connected: '+device.id);
    });

    this.gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
      console.log('Gamepad disconnected: '+device.id);
    });

    this.gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
      console.warn('Unsupported gamepad connected: '+device.id);
    });

    if (!this.gamepad.init()) {
      console.warn('Gamepads are not supported on this browser');
    }

    // Hook to the gameloop
    this.update = this.update.bind(this);
    this.game.hook(this.update);

    this.firing = false;

    this.lastTime = new Date( ).getTime( );

    var that = this;

    $(document).keyup(function (e) {
      if (e.which === 81) {
        if (that.menu.displayed) {
          that.menu.close();
        } else {
          that.menu.open();
        }
      } else {
        if (that.menu.displayed) {
          if (e.which === 32 || e.which === 13) {
            that.menu.selectItem();
          }
          if (e.which === 38) {
            that.menu.updateHovered('up');
          }
          if (e.which === 40) {
            that.menu.updateHovered('down');
          }
        }
      }
    });
  },

  destruct: function( ) {
    this.game.unhook( this.update );
  },

  update: function( time, delta ) {
    var mouseControls = false;

    var gamepadYaw = false;
    var hasGamepad = !!this.gamepad.gamepads.length;

    var now = new Date( ).getTime( );
    var difference = now - this.lastTime;

    var root = this.player.root;

    var pitch = 0;
    var roll = 0;
    var yaw = 0;

    var thrust = 0;
    var brakes = 0;
    var thrustScalar = this.options.thrustImpulse/s.config.ship.maxSpeed + 1;

    var centerY = this.HUD.canvas.height/2;
    var centerX = this.HUD.canvas.width/2;

    ///////////////////////
    // RADIAL SUBRETICLE //
    ///////////////////////

    var yawSpeed = this.options.yawSpeed,
      pitchSpeed = this.options.pitchSpeed,
      cursor = this.HUD.cursorVector,
      radius = this.HUD.subreticleBound.radius,
      crosshairs = {width: 30, height: 30};

    ///////////////////////
    // KEYBOARD COMMANDS //
    ///////////////////////

    if (!this.menu.displayed) {
      if (this.keyboard.pressed('left')) {
        yaw = yawSpeed / thrustScalar;
      }
      else if (this.keyboard.pressed('right')) {
        yaw = -1*yawSpeed / thrustScalar;
      }

      if (this.keyboard.pressed('up')) {
        // Pitch down
        pitch = -1*pitchSpeed / thrustScalar;
      }
      else if (this.keyboard.pressed('down')) {
        // Pitch up
        pitch = pitchSpeed / thrustScalar;
      }

      if (this.keyboard.pressed('w')) {
        thrust = 1;
      }
      else if (this.keyboard.pressed('s')) {
        brakes = 1;
      }

      if (this.keyboard.pressed('a')) {
        roll = this.options.rotationSpeed;
      }
      else if (this.keyboard.pressed('d')) {
        roll = -1*this.options.rotationSpeed;
      }

      if (this.game.gameFire && this.keyboard.pressed('space') || this.firing){
        this.player.fire('turret');
      }
    }

    if (this.keyboard.pressed('tilde')) {
      vr.resetHmdOrientation();
    }

    ///////////////////////
    // GAMEPAD CONTROLS  //
    ///////////////////////

    if (hasGamepad) {
      var gamepadThrust, gamepadState = this.gamepad.gamepads[0].state;
      if (!this.menu.displayed) {

        // Flight stick controls.
        if (!gamepadState.RIGHT_STICK_Y) {

          // TODO: Handle inverted option
          pitch = gamepadState.LEFT_STICK_Y;
          roll = gamepadState.LEFT_STICK_X*-1 * this.options.rotationSpeed;
          yaw = 0;

          if (gamepadState.RB || gamepadState.X || gamepadState.FACE_1)
            this.firing = true;
          else
            this.firing = false;

          gamepadThrust = (gamepadState.RIGHT_STICK_X*-1 + 1)/2;

          this.options.thrustImpulse = gamepadThrust * s.config.ship.maxSpeed;

        } else {
          // Gamepad controls

          if (gamepadState.RIGHT_BOTTOM_SHOULDER) {
            this.firing = true;
          } else {
            this.firing = false;
          }

          pitch = gamepadState.RIGHT_STICK_Y/2;
          roll = (gamepadState.LEFT_STICK_X*-1 * this.options.rotationSpeed)/2;
          yaw = gamepadState.RIGHT_STICK_X * -1;

          thrust = gamepadState.LEFT_STICK_Y*-1 > 0.1 ? gamepadState.LEFT_STICK_Y*-1: 0;
          brakes = gamepadState.LEFT_STICK_Y > 0.1 ? gamepadState.LEFT_STICK_Y: 0;
        }
      } else {
        // Menu navigation with controllers
        if (this.slowControllerScroll) {
          if (gamepadState.LEFT_STICK_Y > 0.4 || gamepadState.RIGHT_STICK_Y > 0.4 && !this.oculus.detected) {
            this.menu.updateHovered('down');
            this.slowControllerScroll = false;
          } else if (gamepadState.LEFT_STICK_Y < -0.4 || gamepadState.RIGHT_STICK_Y < -0.4 && !this.oculus.detected) {
            this.menu.updateHovered('up');
            this.slowControllerScroll = false;
          }
          if (gamepadState.FACE_1 || gamepadState.FACE_2 || gamepadState.FACE_3 || gamepadState.FACE_4 || gamepadState.LEFT_BOTTOM_SHOULDER || gamepadState.RIGHT_BOTTOM_SHOULDER) {
            this.menu.selectItem();
            this.slowControllerScroll = false;
          }
        }
        if (gamepadState.LEFT_STICK_Y < 0.4 && gamepadState.RIGHT_STICK_Y < 0.4 && gamepadState.LEFT_STICK_Y > -0.4 && gamepadState.RIGHT_STICK_Y > -0.4 && !gamepadState.FACE_1 && !gamepadState.FACE_2 && !gamepadState.FACE_3 && !gamepadState.FACE_4 && !gamepadState.RIGHT_BOTTOM_SHOULDER && !gamepadState.LEFT_BOTTOM_SHOULDER) {
          this.slowControllerScroll = true;
        }
      }
    }

    ///////////////////////
    //  OCULUS CONTROLS  //
    ///////////////////////

    if (this.oculus.detected) {
      this.mouse.mouseType = 'oculus';
      this.camera.rotation.setEulerFromQuaternion(this.oculus.quat);
      if (!this.menu.displayed) {
        if (hasGamepad) {
          pitch += this.oculus.quat.x/2;
          yaw += this.oculus.quat.y/2;
          roll += this.oculus.quat.z;
        } else {
          pitch += this.oculus.quat.x;
          yaw += this.oculus.quat.y;
          roll += this.oculus.quat.z*1.5;
        }
      } else {
        this.menu.updateHovered();
      }
    } else {
      this.mouse.mouseType = 'keyboard';
    }

    //////////////////////////////
    // MOTION AND PHYSICS LOGIC //
    //////////////////////////////

    var linearVelocity = root.getLinearVelocity().clone();
    var angularVelocity = root.getAngularVelocity().clone();
    var rotationMatrix = new THREE.Matrix4();
    rotationMatrix.extractRotation(root.matrix);

    // Apply rotation
    // Bleed off angular velocity towards zero
    angularVelocity = angularVelocity.clone().divideScalar(this.options.rotationFadeFactor);
    root.setAngularVelocity(angularVelocity);

    // If ship position is greater then x apply thrust in opposite direction
    // If ship position is not greater then x allow to apply thrust
    var playerPosition = this.player.root.position;
    var boundryLimit = 30000;

    // If the ship is beyound the boundary limit steer it back into the map

    if(s.util.largerThan(playerPosition, boundryLimit)){
      var boundryPush = new THREE.Vector3(-2*this.options.boundaryPushback*this.options.thrustImpulse, 0, 2*this.options.boundaryPushback*this.options.thrustImpulse ).applyMatrix4(rotationMatrix);
      yaw = this.options.boundaryPushback;
      if (this.options.boundaryPushback < 2) this.options.boundaryPushback += 0.01;
      root.applyCentralImpulse(boundryPush);
      console.log('--Outside Boundry Limit--');
    } else if (this.options.boundaryPushback > 0) {
      this.options.boundaryPushback -= 0.005;
    }

    // Add to the existing angular velocity,
    var newAngularVelocity = new THREE.Vector3(pitch, yaw, roll).applyMatrix4(rotationMatrix).add(angularVelocity);
    root.setAngularVelocity(newAngularVelocity);

    // Apply thrust
    // Invert existing linear velocity
    // Fractionally apply the opposite impulse
    // Then apply forward impulse

    if (thrust && this.options.thrustImpulse < s.config.ship.maxSpeed){
      this.options.thrustImpulse += (difference > s.config.ship.maxSpeed) ?
        s.config.ship.maxSpeed : difference;
    }

    if (brakes && this.options.thrustImpulse > 0){
      this.options.thrustImpulse -= difference;
    }

    var impulse = linearVelocity.clone().negate();
    root.applyCentralImpulse(impulse);

    var forceVector = new THREE.Vector3(0, 0, -1*this.options.thrustImpulse).applyMatrix4(rotationMatrix);
    root.applyCentralImpulse(forceVector);
    this.lastTime = now;
  }
});
