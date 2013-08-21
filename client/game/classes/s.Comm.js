s.Comm = new Class( {
    extend: s.EventEmitter,
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

        // Prepend http
        options.server = 'http://' + options.server;

        this.player = options.player;
        this.ship = options.ship;

        var that = this;

        this.lastMessageTime = 0;

        // Create socket connection
        this.socket = io.connect( options.server );

        this.socket.on('welcome', function(data){
            console.log('yolo! we be connected');
            console.log('data:', data);
        });

        this.socket.on( 'join', this.makeTrigger( 'join' ) );

        this.socket.on( 'failed', function ( message ) {
            // try to reconnect
            that.connected( );
        } );

        this.socket.on( 'player list', this.makeTrigger( 'player list' ) );

        this.socket.on( 'killed', this.makeTrigger( 'killed' ) );

        this.socket.on( 'fire', this.makeTrigger( 'fire' ) );

        this.socket.on( 'hit', this.makeTrigger( 'hit' ) );

        this.socket.on( 'leave', this.makeTrigger( 'leave' ) );

        this.socket.on( 'move', this.makeTrigger( 'move' ) );

    },

    connected: function ( ) {
        var time = new Date( ).getTime( );
        var shipPosition = this.ship.getPositionPacket( );

        var packet = {
            evt: 'joined',
            name: this.player.name,
            time: time,
            pos: shipPosition.pos,
            rot: shipPosition.rot,
            tRot: shipPosition.tRot,
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
                    tRot: shipPosition.tRot,
                    aVeloc: shipPosition.aVeloc,
                    lVeloc: shipPosition.lVeloc
                };

                // Broadcast position
                this.socket.emit( 'move', packet );
                this.lastMessageTime = time;
            }
        }
    },
    fire: function ( pos, rot, type ) {
        this.socket.emit( 'fire', {
            pos: pos,
            rot: rot,
            type: type
        } );
    },
    died: function ( otherPlayerName ) {
        this.socket.emit( 'killed', {
            killer: otherPlayerName
        } );
    },
    hit: function ( otherPlayerName, type ) {
        this.socket.emit( 'hit', {
            name: otherPlayerName,
            type: type
        } );
    }
} );
