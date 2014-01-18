s.Mouse = new Class({
  toString: 'Mouse',

  construct: function (mouseType, options) {
    // ensure that s.Mouse.update always runs in the context of the mouse
    this.update = this.update.bind(this);
    this.oculusMouse = this.oculusMouse.bind(this);
    this.keyboardMouse = this.keyboardMouse.bind(this);
    this.noMouse = this.noMouse.bind(this);

    this.mouseType = mouseType;
    this.mice = {
      'oculus'  : this.oculusMouse,
      'keyboard': this.keyboardMouse,
      'none'    : this.noMouse
    };

    // Store references to game objects from s.Controls
    this.HUD = options.HUD;
    this.game = options.game;
    this.player = options.player;
    this.camera = options.camera;
  },

  update: function () {
    return this.mice[this.mouseType].apply(this, arguments);
  },

  keyboardMouse: function (movables) {
    // Set yaw to zero if cursor is inside the crosshair region
    if (this.HUD.targetX > movables.centerX - movables.crosshairs.width/2 &&
        this.HUD.targetX < movables.centerX + movables.crosshairs.width/2){
      movables.yaw = 0;
    } else {
      // X scales yaw
      var yawDivisor = this.HUD.targetX < movables.centerX ?
        (movables.centerX-movables.radius)/((movables.centerX-this.HUD.targetX)*4) :
        -(movables.centerX+movables.radius)/((-movables.centerX+this.HUD.targetX)*4);
      movables.yaw = movables.yawSpeed/yawDivisor/movables.thrustScalar;
    }

    // Set pitch to zero if cursor is inside the crosshair region
    if (this.HUD.targetY > movables.centerY - movables.crosshairs.height/2 && this.HUD.targetY < movables.centerY + movables.crosshairs.height/2){
      movables.pitch = 0;
    } else {
      // Y scales pitch
      var pitchDivisor = this.HUD.targetY < movables.centerY ?
        (movables.centerY+movables.radius)/((movables.centerY-this.HUD.targetY)*4) : -(movables.centerY+movables.radius)/((-movables.centerY+this.HUD.targetY)*4);
      movables.pitch = movables.pitchSpeed/pitchDivisor/movables.thrustScalar;
    }
    return {yaw: movables.yaw, pitch: movables.pitch};
  },

  oculusMouse: function (movables) {
    var brakes;
    var thrust;
    // X makes the oculus view look left or right, leaving the ship fixed

    // Also:
    // Y makes the ship throttle or break;
    if (this.HUD.targetY > movables.centerY - movables.crosshairs.height/2 && this.HUD.targetY < movables.centerY + movables.crosshairs.height/2){
      brakes = 1;
    } else {
      thrust = 1;
    }
    return {brakes: brakes, thrust: thrust};
  },

  noMouse: function (movables) {
    this.HUD.targetX = movables.centerX;
    this.HUD.targetY = movables.centerY;
    return {}; // for s.Control Ln:120 and 121;
  },

});
