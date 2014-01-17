s.Controls = new Class({

    toString: 'Controls',


    options: {

        rotationSpeed: Math.PI/2,
        pitchSpeed: Math.PI/4,
        yawSpeed: Math.PI/4,
        thrustImpulse: 0,
        brakePower: 0.85,
        velocityFadeFactor: 16,
        rotationFadeFactor: 4

    },

    construct: function( options ) {

        // Store references to game objects
        this.HUD = options.HUD;
        this.game = options.game;
        this.player = options.player;
        this.camera = options.camera;

        // Create interpreters for controllers
        this.keyboard = new s.Keyboard( );

        // Gamepad interface
        this.gamepad = new Gamepad();

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
    },

    destruct: function( ) {

        game.unhook( this.update );

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

        if (mouseControls) {
            // Set yaw to zero if cursor is inside the crosshair region
            if (this.HUD.targetX > centerX - crosshairs.width/2 && this.HUD.targetX < centerX + crosshairs.width/2){
                yaw = 0;
            } else {
                // X scales yaw
                var yawDivisor = this.HUD.targetX < centerX ?
                    (centerX-radius)/((centerX-this.HUD.targetX)*4) : -(centerX+radius)/((-centerX+this.HUD.targetX)*4);
                yaw = yawSpeed/yawDivisor/thrustScalar;
            }

            // Set pitch to zero if cursor is inside the crosshair region
            if (this.HUD.targetY > centerY - crosshairs.height/2 && this.HUD.targetY < centerY + crosshairs.height/2){
                pitch = 0;
            } else {
                // Y scales pitch
                var pitchDivisor = this.HUD.targetY < centerY ?
                    (centerY+radius)/((centerY-this.HUD.targetY)*4) : -(centerY+radius)/((-centerY+this.HUD.targetY)*4);
                pitch = pitchSpeed/pitchDivisor/thrustScalar;
            }
        }
        else {
            this.HUD.targetX = centerX;
            this.HUD.targetY = centerY;
        }

        ///////////////////////
        // GAMEPAD CONTROLS  //
        ///////////////////////
        if (hasGamepad) {
            var gamepadState = this.gamepad.gamepads[0].state;

            // TODO: Handle inverted option
            pitch = gamepadState.LEFT_STICK_Y;
            
            if (gamepadYaw) {
                yaw = gamepadState.LEFT_STICK_X*-1;
            }
            else {
                roll = gamepadState.LEFT_STICK_X*-1 * this.options.rotationSpeed;
            }

            if (gamepadState.RB || gamepadState.X || gamepadState.FACE_1)
                this.firing = true;
            else
                this.firing = false;

            var gamepadThrust = (gamepadState.RIGHT_STICK_X*-1 + 1)/2;

            // Set thrust
            this.options.thrustImpulse = gamepadThrust * s.config.ship.maxSpeed;
        }

        ///////////////////////
        // KEYBOARD COMMANDS //
        ///////////////////////

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

        if (this.keyboard.pressed('space') || this.firing){
            this.player.fire('turret');
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

        // Add to the existing angular velocity,
        var newAngularVelocity = new THREE.Vector3(pitch, yaw, roll).applyMatrix4(rotationMatrix).add(angularVelocity);
        root.setAngularVelocity(newAngularVelocity);

        // Apply thrust
        // Invert existing linear velocity
        // Fractionally apply the opposite impulse
        // Then apply forward impulse

        // If ship position is greater then x apply thrust in opposite direction
        // If ship position is not greater then x allow to apply thrust
        var playerPosition = this.player.root.position;
        var boundryLimit = 30000;

        // If the ship is beyound the boundary limit push it back into the map
        /*
        if(s.util.largerThan(playerPosition, boundryLimit)){
            var boundryPush = new THREE.Vector3(0, 0, 200*this.options.thrustImpulse).applyMatrix4(rotationMatrix);
            root.applyCentralImpulse(boundryPush);
            console.log('--Outside Boundry Limit--');
        }
        */
        
        if (thrust && this.options.thrustImpulse < s.config.ship.maxSpeed){
            this.options.thrustImpulse += difference;
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
