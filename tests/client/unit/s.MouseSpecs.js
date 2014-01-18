describe('Mouse Controls', function () {
  var mouseControl;
  var options = {
    HUD: '',
    game: '',
    player: '',
    camera: ''
  };
  var movables = {
    centerX: '',
    crosshairs: '',
    yaw: '',
    radius: '',
    yawSpeed: '',
    thrustScalar: '',
    centerY: '',
    pitch: '',
    pitchSpeed: ''
  }
  var keyboardMouse;
  var oculusMouse;
  var noMouse;

  beforeEach(function () {
    keyboardMouse = new s.Mouse('keyboard', options);
    oculusMouse = new s.Mouse('oculus', options);
    noMouse = new s.Mouse('none', options);
  });

  it('should have a `mice` option for different types of mouse controls', function () {
    expect(keyboardMouse).to.be.an('object');
    expect(keyboardMouse).to.have.property('mice');
  });

  it('should have mouse functions for oculus, keyboard, and noMouse controls', function () {
    expect(keyboardMouse).to.have.property('noMouse');
    expect(keyboardMouse).to.have.property('keyboardMouse');
    expect(keyboardMouse).to.have.property('oculusMouse');

    expect(keyboardMouse.noMouse).to.be.a('function');
    expect(keyboardMouse.keyboardMouse).to.be.a('function');
    expect(keyboardMouse.oculusMouse).to.be.a('function');
  });

  it('should call `keyboardMouse` and return an object when running an `update` on an s.Mouse("keyboard", options)', function () {
    var res = keyboardMouse.update({
      centerX: 1,
      crosshairs: {width:1,height:1},
      yaw: 1,
      radius: 1,
      yawSpeed: 1,
      thrustScalar: 1,
      centerY: 1,
      pitch: 1,
      pitchSpeed: 1
    });
    expect(res).to.be.an('object');
  });

});
