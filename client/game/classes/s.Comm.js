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
    
    // makeTrigger is responsible for broadcasting all events
    // receieved from the server to the rest of the game.
    makeTrigger: function ( evt ) {
        var that = this;
        return function ( message ) {
            console.log(evt,message);
            that.trigger.call( that, evt, message );
        };
    },
    destruct: function ( ) {
        // TODO: Send server some kind of destruct message?
    },
    construct: function ( options ) {
        this.game = options.game;
        // Prepend http
        options.server = 'http://' + options.server;

        this.player = options.player;
        this.ship = options.ship;

        this.pilot = options.pilot;
        var that = this;

        this.lastMessageTime = 0;

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

        this.game.hook(this.position);

    },

    connected: function ( ) {
        var time = new Date( ).getTime( );
        var shipPosition = this.game.player.getPositionPacket( );

        var packet = {
            evt: 'joined',
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
        var time = new Date( ).getTime( );

        // Never send faster than server can handle
        if ( time - this.lastMessageTime >= 15 ) {
            var shipPosition = this.ship.getPositionPacket( );

            // TODO: Figure out if ship or turret actually moved
            var shipMoved = true;

            // If ship moved, send packet
            if ( shipMoved ) {
                // Build packet
                var packet = {
                    time: time,
                    pos: shipPosition.pos,
                    rot: shipPosition.rot,
                    aVeloc: shipPosition.aVeloc,
                    lVeloc: shipPosition.lVeloc
                };

                // Broadcast position
                this.socket.emit( 'move', packet );
                this.lastMessageTime = time;
            }
        }
    }
} );
