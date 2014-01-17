s.Oculus = new Class({
  construct: function () {
    this.quat = {x: 0, y: 0, z: 0};
    this.detected = false;

    this.getNewOrientetion = function (data) {
      this.quat.x = data.x;
      this.quat.y = data.y;
      this.quat.z = data.z;
    };

    this.bridgeConnected = function () {
      this.detected = true;
    };

    var that = this;
    var oculusBridge = new OculusBridge({
      onOrientationUpdate : function (e) { that.getNewOrientetion(e); },
      onConnect           : function () { that.bridgeConnected(); }
    });

    oculusBridge.connect();
  }
});