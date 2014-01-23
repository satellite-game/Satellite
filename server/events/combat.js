module.exports = function (host, sync) {
  return {
    move: function( socket, packet ) {
      var room = host.sockets[socket.id].room;
      var shipName = host.sockets[socket.id].name;
      // console.log(room, shipName);
      // console.log('=====================');
      // console.log(host.rooms[room], host.rooms[room].gamestate);
      var playerState = host.rooms[room].gamestate[shipName];
      if(sync.setMove(packet, playerState)) {
        for(var i in packet) {
          playerState[i] = packet[i];
        }
        socket.broadcast.to(room).emit('move', playerState);
      }
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
        otherPlayerName: packet.otherPlayerName,
        yourName: packet.yourName
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
