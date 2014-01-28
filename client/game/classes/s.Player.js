s.Player = new Class({
  extend: s.Ship,
  construct: function(options) {

    this.camera = options.camera;
    this.HUD = options.HUD;
    this.firstPerson = false;
    this.name = options.name || '';
    this.initialize(options);

    this.root.castShadow = true;

    // Moon facing initilization
    //this.player.root.lookAt(this.moon.root.position);

    // Root camera to the player's position
    this.root.add( this.camera );

    this.trailGlow = new THREE.PointLight(0x00FFFF, 5, 20);
    this.trailGlow.intensity = 0;
    this.root.add( this.trailGlow );
    this.trailGlow.position.set(0, 0, 35);

    this.game.hook(this.update);

    // Setup camera: Cockpit view; COMMENT OUT FOR CHASE CAM
    // this.camera.position.set( 0, 0, 0 );

    // Setup camera: Chase view
    this.game.camera.position.set(0,35,250);

    // Create particle objects for engine trail.
    this.flames = [];

    for (var i = 0; i < 5; i++) {
      var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: s.textures.particle,
        useScreenCoordinates: false,
        blending: THREE.AdditiveBlending,
        color: 0x00FFFF
      }));

      this.flames.push(sprite);
      sprite.position.set(0, 0, (i*10)+40);
      this.root.add(sprite);
    }
  },

  update: function() {

    // Adjusts engine glow based on linear velosity
    this.trailGlow.intensity = this.root.getLinearVelocity().length()/100;

    var ocuScale = this.game.oculus.detected ? 0.2 : 1;
    var flameScaler = (Math.random()*0.1 + 1)*ocuScale;

    this.flames[0].scale.set(2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler);
    this.flames[1].scale.set(3*this.trailGlow.intensity*flameScaler, 3*this.trailGlow.intensity*flameScaler, 3*this.trailGlow.intensity*flameScaler);
    this.flames[2].scale.set(2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler, 2*this.trailGlow.intensity*flameScaler);
    this.flames[3].scale.set(1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler);
    this.flames[4].scale.set(1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler, 1*this.trailGlow.intensity*flameScaler);
  }
});
