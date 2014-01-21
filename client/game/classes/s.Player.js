s.Player = new Class({
  extend: s.Ship,
  construct: function(options) {

    this.camera = options.camera;
    this.game = options.game;
    this.HUD = options.HUD;
    this.firstPerson = false;

    this.root.castShadow = true;

    // Moon facing initilization
    //this.player.root.lookAt(this.moon.root.position);

    // Root camera to the player's position
    this.root.add( this.camera );

    this.trailGlow = new THREE.PointLight(0x00FFFF, 5, 20);
    this.trailGlow.intensity = 0;
    this.root.add( this.trailGlow );
    this.trailGlow.position.set(0, 0, 35);

    // this.player.root.add( new THREE.PointLightHelper(this.trailGlow, 1) );
    this.game.hook(this.update);

    // Setup camera: Cockpit view; COMMENT OUT FOR CHASE CAM
    // this.camera.position.set( 0, 0, 0 );

    // Setup camera: Chase view
    this.game.camera.position.set(0,35,250);
  },
  update: function() {
    if (this.hull <= 0){
      this.game.handleDie();
    }
    // Adjusts engine glow based on linear velosity
    this.trailGlow.intensity = this.root.getLinearVelocity().length()/100;
  }

});
