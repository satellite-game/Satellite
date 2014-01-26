/**
*
* s.Comm ---
* allows us to compartmentalize all interactions
* with the server to this class (s.Comm) --this class
* is the only place that holds the logic that allows
* the client to communicate with the server.
*
**/

s.Comm = new Class( {

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

        options.server = 'http://' + options.server;

        this.player = options.player;

        this.delta = 0;

        this.ship = options.ship;

        this.pilot = options.pilot;

        this.room = options.room;

        var that = this;


        this.lastMessageTime = new Date( ).getTime( );

        // Create socket connection


        this.socket = io.connect( options.server );


        this.socket.on( 'join', this.makeTrigger( 'join' ) );

        this.socket.on( 'failed', function ( message ) {
            // try to reconnect
            that.connected( );
        } );

        this.socket.on( 'player list', this.makeTrigger( 'player list' ) );

        this.socket.on( 'leave', this.makeTrigger( 'leave' ) );

        this.socket.on( 'move', this.makeTrigger( 'move' ) );

        this.socket.on( 'killed', this.makeTrigger( 'killed' ));

        this.socket.on( 'fire', this.makeTrigger( 'fire' ));

        this.socket.on( 'hit', this.makeTrigger( 'hit' ));

        this.socket.on( 'sync', this.makeTrigger( 'sync'));

        this.socket.on( 'bot retrieval', this.makeTrigger( 'bot retrieval' ));

        this.socket.on( 'bot positions', this.makeTrigger( 'bot positions' ));

        this.game.hook( this.position );

        this.clockTick = this.clockTick.bind(this);

        this.timer = setInterval(this.clockTick,1000);

        this.time = 0;


    },

    connected: function ( ) {


        var time = new Date( ).getTime( );


        var shipPosition = this.game.player.getPositionPacket( );
        var packet = {
            room: this.room,

            evt: 'joined',

            name: this.pilot.name,

            time: time,

            pos: shipPosition.pos,

            rot: shipPosition.rot,

            aVeloc: shipPosition.aVeloc,

            lVeloc: shipPosition.lVeloc,

        };


        // Broadcast position

        this.socket.emit('join', packet );

    },


    position: function ( ) {
      if(this.lastPosition === undefined) {
        this.lastPosition = s.game.player.getPositionPacket( );
        this.lastTime = new Date().getTime();
      }
      var time = new Date( ).getTime( );
      var shipPosition = s.game.player.getPositionPacket( );
          shipPosition.laccel = [];
          shipPosition.aAccel = [];
      var delta = function() {
        var results = {};
        var diff;
        var t_diff;
        for(var i = 0; i < 3; i++) {
          diff = Math.abs( shipPosition.lVeloc[i] - this.lastPosition.lVeloc[i]);
          t_diff = time - this.lastTime;

          if(t_diff === 0 || isNaN(t_diff) ) {
            return "Invalid";
          } else {
            shipPosition.laccel.push(diff/t_diff);
          }

          diff = Math.abs( shipPosition.aVeloc[i] - this.lastPosition.aVeloc[i]);
          t_diff = time - this.lastTime;
          if(t_diff === 0 || isNaN(t_diff) ) {
            return "Invalid";
          } else {
            shipPosition.aAccel.push(diff/t_diff);
          }
        }
        return results;
      }();
      if(delta === 'Invalid') {
        return;
      } else {
        var packet = {
          time: time,
          pos: shipPosition.pos,
          rot: shipPosition.rot,
          aVeloc: shipPosition.aVeloc,
          lVeloc: shipPosition.lVeloc,
          aAccel: shipPosition.aAccel,
          lAccel: shipPosition.lAccel
        };

        s.game.comm.socket.emit( 'combat','move', packet );
        s.game.comm.lastMessageTime = time;
        this.lastPosition = shipPosition;
        this.lastTime = time; 
      }
    },


    fire: function( pos, rot, velocity ) {

        this.time = 0;

        this.socket.emit( 'combat','fire', {

            position: pos,

            rotation: rot,

            initialVelocity: velocity

        });
    },


    died: function( you, killer ) {

        this.socket.emit( 'player','killed',{

            you: you,

            killer: killer

             });

    },


    hit: function( otherPlayerName, yourName ) {

        this.time = 0;

        this.socket.emit( 'combat','hit', {

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

    sendKey: function(direction, key){
        var time = new Date().getTime();
        // Never send faster than server can handle
        if ( time - s.game.comm.lastMessageTime >= 15 ) {
            var shipPosition = s.game.player.getPositionPacket();
            // TODO: Figure out if ship or turret actually moved
            // If ship moved, send packet
            if ( this.lastPosition !== shipPosition.pos ) {
                // Build packet
                this.time = 0;

                var packet = {
                    time: time,
                    room: this.room,
                    name: this.pilot.name,
                    pos: shipPosition.pos,
                    rot: shipPosition.rot,
                    aVeloc: shipPosition.aVeloc,
                    lVeloc: shipPosition.lVeloc
                };
                // Broadcast position
                this.socket.emit( 'keypress', direction, $.extend(packet, { direction: direction, key: key }) );
                s.game.comm.lastMessageTime = time;
                this.lastPosition = shipPosition.pos;
            }
        }
    },

    botInfo: function(message) {
        this.socket.emit('botInfo', message);
    },

    botHit: function( yourName, botName ) {

        this.time = 0;

        this.socket.emit( 'botHit', {

            yourName: yourName,

            botName: botName

        });
    },

    botUpdate: function(enemies) {
        this.socket.emit( 'botUpdate', enemies);
    }
} );
