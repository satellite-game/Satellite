module.exports = function (host, Sync) {
  return {
    keyup: function (socket, packet) {
      var playerState = host.rooms[host.sockets[socket.id].room]
                        .gamestate[host.sockets[socket.id].name];
      var isLegalMove = Sync.setMove(packet, playerState);

      if(isLegalMove) {
        for(var i in packet) {
          playerState[i] = packet[i];
        };
        socket.broadcast.to(host.sockets[socket.id].room).emit('move', playerState);
      }
    },
    keydown: function (socket, packet) {
      var playerState = host.rooms[host.sockets[socket.id].room]
                        .gamestate[host.sockets[socket.id].name];
      var isLegalMove = Sync.setMove(packet, playerState);

      if(isLegalMove) {
        for(var i in packet) {
          playerState[i] = packet[i];
        };
        socket.broadcast.to(host.sockets[socket.id].room).emit('move', playerState);
      }
    },
  }
};