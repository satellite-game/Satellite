s.Mouse = new Class({
  toString: 'Mouse',

  mice: {
    'oculus'  : function(){ this.oculusMouse(); },
    'keyboard': function(){ this.keyboardMouse(); },
    'none'    : function(){ this.noMouse(); }
  },

  construct: function (mouseType, options) {
    this.mouseType = mouseType;
    // Store references to game objects from s.Controls
    this.HUD = options.HUD;
    this.game = options.game;
    this.player = options.player;
    this.camera = options.camera;
  },

  update: function (movables) {
    this.mice[this.mouseType].call(this, moveables);
  },

  keyboardMouse: function (moveables) {
    // Set yaw to zero if cursor is inside the crosshair region
    if (this.HUD.targetX > moveables.centerX - moveables.crosshairs.width/2 &&
        this.HUD.targetX < moveables.centerX + moveables.crosshairs.width/2){
      moveables.yaw = 0;
    } else {
      // X scales yaw
      var yawDivisor = this.HUD.targetX < moveables.centerX ?
        (moveables.centerX-moveables.radius)/((moveables.centerX-this.HUD.targetX)*4) :
        -(moveables.centerX+moveables.radius)/((-moveables.centerX+this.HUD.targetX)*4);
      moveables.yaw = moveables.yawSpeed/moveables.yawDivisor/moveables.thrustScalar;
      console.log(yaw);
    }

    // Set pitch to zero if cursor is inside the crosshair region
    if (this.HUD.targetY > moveables.centerY - crosshairs.height/2 && this.HUD.targetY < moveables.centerY + moveables.crosshairs.height/2){
      moveables.pitch = 0;
    } else {
      // Y scales pitch
      var pitchDivisor = this.HUD.targetY < moveables.centerY ?
        (moveables.centerY+moveables.radius)/((moveables.centerY-this.HUD.targetY)*4) : -(moveables.centerY+moveables.radius)/((-moveables.centerY+this.HUD.targetY)*4);
      moveables.pitch = moveables.pitchSpeed/moveables.pitchDivisor/moveables.thrustScalar;
    }
  },

  oculusMouse: function () {

  },

  noMouse: function () {
    this.HUD.targetX = centerX;
    this.HUD.targetY = centerY;
  },

});
