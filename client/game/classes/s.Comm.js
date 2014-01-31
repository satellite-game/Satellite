/**
*
* s.Comm ---
* allows us to compartmentalize all interactions
* with the server to this class (s.Comm) --this class
* is the only place that holds the logic that allows
* the client to communicate with the server.
*
**/

s.Comm = new Class({

  extend: s.EventEmitter,

  toString: "Comm",

  // makeTrigger is responsible for broadcasting all events

  // receieved from the server to the rest of the game.

  makeTrigger: function ( evt ) {
    var that = this;

    return function ( message ) {
      that.trigger.call( that, evt, message );
    };
  },

  destruct: function ( ) {
    // TODO: Send server some kind of destruct message?
  },

  construct: function ( options ) {
    //binding the game's context
    this.game = options.game;
    // Prepend http. Doing this so that you can customize the server before finalizing the string.
    this.player = options.player;
    this.ship = options.ship;
    this.server = 'http://' + options.server;
    this.pilot = options.pilot;

    var that = this;

    this.lastMessageTime = new Date( ).getTime( );
    this.clockTick = this.clockTick.bind(this);
    this.timer = setInterval(this.clockTick,1000);
    this.time = 0;

  },

  connectSockets: function ( ) {
    // this takes in a room to join - where do we send the roomname we are getting on invokation?
    this.socket = io.connect( this.server );

    this.socket.on('failed', function ( message ) {
      // try to reconnect
      that.connected();
    });
    this.socket.on('join', this.makeTrigger('join'));
    this.socket.on('player list', this.makeTrigger('player list'));
    this.socket.on('leave', this.makeTrigger('leave'));
    this.socket.on('move', this.makeTrigger('move'));
    this.socket.on('killed', this.makeTrigger('killed'));
    this.socket.on('sync', this.makeTrigger('sync'));
    this.socket.on('fire', this.makeTrigger('fire'));
    this.socket.on('hit', this.makeTrigger('hit'));
    this.socket.on('bot retrieval', this.makeTrigger('bot retrieval'));
    this.socket.on('bot positions', this.makeTrigger('bot positions'));
    this.socket.on('baseHit', this.makeTrigger( 'baseHit' ));
    this.socket.on('setTeam', this.makeTrigger( 'setTeam' ));

    this.game.hook( this.position );

    this.connected();
  },

  connected: function ( ) {
    var time = new Date( ).getTime( );

    var shipPosition = this.game.player.getPositionPacket( );

    var packet = {
      evt: 'joined',
      room: this.game.room,
      teamMode: this.game.teamMode,
      humansOnly: this.game.humansOnly,
      name: this.pilot.name,
      time: time,
      pos: shipPosition.pos,
      rot: shipPosition.rot,
      aVeloc: shipPosition.aVeloc,
      lVeloc: shipPosition.lVeloc
    };

    // Broadcast position
    this.socket.emit( 'join', packet );
  },

  position: function ( ) {
    // would this be better to put in the global scope so that we don't
    // wind up making this check every single time. Currently these are
    // all happening in the global scope anyways...
    if(this.lastPosition === undefined) {
      this.lastPosition = s.game.player.getPositionPacket( );
      this.lastTime = new Date().getTime();
      this.movementThrottle = 0;
      this.syncTimer = 0;
    }
    var time = new Date( ).getTime( );
    var shipPosition = s.game.player.getPositionPacket( );
        shipPosition.lAccel = [0,0,0];
        shipPosition.aAccel = [0,0,0];
    var t_diff = time - this.lastTime;

    // benchmarked this against other variants for 96% efficency.
    // http://jsperf.com/delta-function-or-raw-calculation
    if (t_diff !== 0) {
      shipPosition.lAccel[0] = (shipPosition.lVeloc[0] - this.lastPosition.lVeloc[0]) / t_diff;
      shipPosition.aAccel[0] = (shipPosition.aVeloc[0] - this.lastPosition.aVeloc[0]) / t_diff;

      shipPosition.lAccel[1] = (shipPosition.lVeloc[1] - this.lastPosition.lVeloc[1]) / t_diff;
      shipPosition.aAccel[1] = (shipPosition.aVeloc[1] - this.lastPosition.aVeloc[1]) / t_diff;

      shipPosition.lAccel[2] = (shipPosition.lVeloc[2] - this.lastPosition.lVeloc[2]) / t_diff;
      shipPosition.aAccel[2] = (shipPosition.aVeloc[2] - this.lastPosition.aVeloc[2]) / t_diff;

      // using Math.abs: http://jsperf.com/mathabs-vs-two-conditions
      if(this.movementThrottle === 0){
        if( this.syncTimer === 0 ||
          Math.abs(shipPosition.aAccel[0]) > 0.000005 ||
          Math.abs(shipPosition.aAccel[1]) > 0.000005 ||
          Math.abs(shipPosition.aAccel[2]) > 0.000005 ||
          Math.abs(shipPosition.lAccel[0]) > 0.005 ||
          Math.abs(shipPosition.lAccel[1]) > 0.005 ||
          Math.abs(shipPosition.lAccel[2]) > 0.005 ) {
          var packet = {
            time: time, // is this nessecary?
            pos: shipPosition.pos,
            rot: shipPosition.rot,
            aVeloc: shipPosition.aVeloc,
            lVeloc: shipPosition.lVeloc,
            // not sure if we need to send this to the
            // server except for testing purposes.
            aAccel: shipPosition.aAccel,
            lAccel: shipPosition.lAccel,
            alliance: s.game.player.alliance
          };
          s.game.comm.socket.emit( 'combat','move', packet );
          s.game.comm.lastMessageTime = time;
          this.lastPosition = shipPosition;
          this.lastTime = time;
        }
      }
    }
    // throttle network emmissions by 80%
    this.movementThrottle = (this.movementThrottle + 1) % 5;
    // sync players every second (assuming the player runs every 60fps)
    this.syncTimer = (this.syncTimer + 1) % 60;
  },

  fire: function( pos, rot, velocity ) {
    this.time = 0;

    this.socket.emit('combat', 'fire', {
        position: pos,
        rotation: rot,
        initialVelocity: velocity
    });
  },

  died: function( you, killer ) {
    this.socket.emit('player', 'killed',{
      you: you,
      killer: killer
    });
  },

  hit: function( otherPlayerName, yourName ) {
    this.time = 0;

    this.socket.emit('combat', 'hit', {
      otherPlayerName: otherPlayerName,
      yourName: yourName
    });
  },

  clockTick: function( ){
    this.time += 1;

    // if ( this.time >= 60 ){
    //     window.location.href = "http://satellite-game.com";
    // }
  },

  botInfo: function(message) {
      this.socket.emit('bot', 'botInfo', message);
  },

  botHit: function( yourName, botName ) {
    this.time = 0;

    this.socket.emit('bot', 'botHit', {
      yourName: yourName,
      botName: botName
    });
  },

  botUpdate: function(enemies) {
    this.socket.emit('bot', 'botUpdate', enemies);
  },

  baseFire: function(baseName, pilotName) {
    this.socket.emit('bot', 'baseFire', {
        baseName: baseName,
        pilotName: pilotName
    });
  }

});
