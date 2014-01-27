s.Oculus = new Class({
  toString: 'oculus',
  construct: function (options) {
    this.quat = new THREE.Quaternion();
    this.detected = false;
    this.game = options.game;
    this.update = this.update.bind(this);

    vr.load(function () {
      this.state = new vr.State();
      console.log(this.state);
      vr.pollState(this.state);
      if (this.state.hmd.present) {
        this.detected = true;
        this.game.hook(this.update);
      }
    }, this);
  },
  update: function () {
    vr.pollState(this.state);
    this.quat.x = this.state.hmd.rotation[0];
    this.quat.y = this.state.hmd.rotation[1];
    this.quat.z = this.state.hmd.rotation[2];
    this.quat.w = this.state.hmd.rotation[3];
  }
});