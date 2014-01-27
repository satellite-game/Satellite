module.exports = function (host, sync) {

  return {
    move: function( socket, packet ) {
      var room = host.sockets[socket.id].room;
      var shipName = host.sockets[socket.id].name;
      var playerState = host.rooms[room].gamestate[shipName];
      // copy over the packet data into the canonical state
      for(var i in packet) {
        playerState[i] = packet[i];
      }
      console.log(packet);
      // emit the canonical state to everyone else
      socket.broadcast.to(room).emit('move', playerState);

    },

    fire: function( socket, packet ) {
      var room = host.sockets[socket.id].room;
      socket.get('name', function (err, name) {
          socket.broadcast.to(room).emit('fire', {
              name: packet.name,
              position: packet.position,
              rotation: packet.rotation,
              initialVelocity: packet.initialVelocity
          });
      });
    },

    hit: function( socket, packet ) {
      var room = host.sockets[socket.id].room;
      var response = {
        zappedName: packet.otherPlayerName,
        killerName: packet.yourName
      };
      socket.broadcast.to(room).emit('hit', response);
      socket.emit('hit', response);
    },

  };
};

  // socket.on('move', function(message) {
  //     socket.get('name', function (err, name) {
  //         if (players[name]) {
  //             var player = players[name];

  //             // Update position
  //             player.pos = message.pos;
  //             player.rot = message.rot;
  //             player.aVeloc = message.aVeloc;
  //             player.lVeloc = message.lVeloc;
  //             player.lastMove = message.time;

  //             // Notify players
  //             socket.broadcast.emit('move', {
  //                 name: name,
  //                 pos: message.pos,
  //                 rot: message.rot,
  //                 aVeloc: message.aVeloc,
  //                 lVeloc: message.lVeloc,
  //                 interp: true
  //             });
  //         }
  //         else {
  //             socket.emit('failed');
  //         }
  //     });
  // });
