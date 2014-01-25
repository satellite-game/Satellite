var db = require('../db/queries');

module.exports = function (map, host, Sync, io) {
  return {
    join: function( socket, data ) {
      var target;
      if(host.rooms[data.room] === undefined) {
        host.init(socket.id, data.room, data);
        target = host.rooms[data.room];
        Sync.sync(io, data.room, host.rooms[data.room].gamestate);
        Sync.setInit( socket.id, target, data );
      } else {
        host.add(socket.id, data.room, data);
        target = host.rooms[data.room];
        Sync.setInit( socket.id, target, data );
      }

      db.joinRoom(data.room, data.name, function(){});  // add to game in the db

      socket.emit('player list', target.playerList);
      socket.emit('map', map.mapItems);
      socket.join(data.room);
      socket.broadcast.to(data.room).emit('join', data);
    },

    disconnect: function( socket ) {
      var room = host.sockets[socket.id].room;
      var name = host.sockets[socket.id].name;

      db.leaveRoom(room, name); // boot from the game in the db

      socket.broadcast.to(room).emit('leave', {name: name});
      delete host.rooms[room].gamestate[name];
      delete host.rooms[room].playerList[name];
      delete host.sockets[socket.id];
    },

  };
};

// LEGACY CODE: not removed because I didn't write this module.
////////////////////////////////////////////////////////////////

  // // Setup message handlers
  // socket.on('join', function(message) {
  //     console.dir(message);
  //     if (players[message.name] !== undefined && ip === players[message.name].ip) {
  //         console.warn('Error: '+message.name+' tried to join twice!');
  //         return;
  //     }

  //     if (!message.name) {
  //         console.error('Error: Cannot join, player name was null!');
  //         socket.emit('failed');
  //         return false;
  //     }

  //     console.log('Player joined: '+message.name);

  //     // Send list of players
  //     socket.emit('player list', players);

  //     // Send the map to the players
  //     socket.emit('map', mapItems);

  //     var pos = getRandomPosition();

  //     socket.set('name', message.name, function() {
  //         // Store client info
  //         players[message.name] = {
  //             name: message.name,
  //             pos: message.pos,
  //             rot: message.rot,
  //             aVeloc: message.aVeloc,
  //             lVeloc: message.lVeloc,
  //             lastMove: getTime(),
  //             ip: ip
  //         };

  //         var packet = {
  //             name: message.name,
  //             pos: message.pos,
  //             rot: [0, 0, 0],
  //             aVeloc: [0, 0, 0],
  //             lVeloc: [0, 0, 0],
  //             interp: false // Not really necessary here, we're telling the client itself to move
  //         };

  //         socket.emit('move', packet);

  //         // Notify players of new challenger
  //         socket.broadcast.emit('join', {
  //             name: message.name,
  //             pos: message.pos,
  //             rot: message.rot,
  //             aVeloc: message.aVeloc,
  //             lVeloc: message.lVeloc
  //         });
  //     });
  // });


  // socket.on('disconnect', function() {
  //     // socket.get('name', function (err, name) {
  //     //     console.log(name+' dropped');

  //     //     // Remove from client list
  //     //     delete players[name];

  //     //     // Notify players
  //     //     socket.broadcast.emit('leave', {
  //     //         name: name
  //     //     });
  //     // });
  // });