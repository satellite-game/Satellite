s.Player = new Class({
  extend: s.Ship,
  construct: function(options) {

    this.camera = options.camera;
    this.game = options.game;
    this.HUD = options.HUD;
    this.firstPerson = false;
    this.name = options.name || '';
    this.initialize(options);

    this.root.castShadow = true;

    // Moon facing initilization
    this.root.lookAt(this.game.moon.root.position);

    // Root camera to the player's position
    this.root.add( this.camera );
    
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
  }
});
