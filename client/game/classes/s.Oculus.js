s.Oculus = new Class({
  construct: function () {
    this.quat = new THREE.Quaternion();
    this.detected = false;

    this.compensationX = 0;
    this.compensationY = 0;
    this.compensationZ = 0;

    this.getNewOrientetion = function (data) {
      this.quat.x = data.x;
      this.quat.y = data.y;
      this.quat.z = data.z;
      this.quat.w = data.w;
    };

    this.bridgeConnected = function () {
      console.log('Oculus Rift connected');
      this.detected = true;
    };

    this.bridgeDisonnected = function () {
      this.detected = false;
      console.log('WARNING: Oculus connection lost');
    };

    var that = this;
    var oculusBridge = new OculusBridge({
      onOrientationUpdate : function (e) { that.getNewOrientetion(e); },
      onConnect           : function () { that.bridgeConnected(); },
      onDisonnect         : function () { that.bridgeDisonnected(); }
    });

    oculusBridge.connect();
  }
});