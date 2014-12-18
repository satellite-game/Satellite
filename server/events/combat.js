module.exports = function ( host ) {

  return {
    move: function( socket, packet ) {
      if( host.sockets[socket.id] === undefined  || host.rooms[host.sockets[socket.id].room] === undefined) {
        socket.disconnect(true);
        return console.log("Combat / Move has an undefined error, client probably needs to relog!");
      }

      var room = host.sockets[socket.id].room;
      socket.broadcast.to(room).emit('move', packet);
    },

    fire: function( socket, packet ) {
      if(host.sockets[socket.id].room === undefined) {
        socket.disconnect(true);
        return console.log("Firing has an error to it etc. Client needs to relog.");
      }
      
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
