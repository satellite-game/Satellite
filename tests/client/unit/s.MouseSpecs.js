describe('Mouse Controls', function () {
  var mouseControl;
  beforeEach(function () {
    var options = {
      HUD: '',
      game: '',
      player: '',
      camera: ''
    };
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
});
