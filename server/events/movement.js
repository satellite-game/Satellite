module.exports = function(host, Sync) {
  return {

    keySync: function (socket, packet) {
      var room = host.sockets[socket.id].room;
      var shipName = host.sockets[socket.id].name;
      var playerState = host.rooms[room].gamestate[shipName];
      // console.log('\npacket:\n',packet,'\nroom:\n',room, '\nshipName:\n',shipName);

      // packet.interp = true;
      // console.log('\npacket:\n',packet,'\nroom:\n',room, '\nshipName:\n',shipName);
      // socket.broadcast.to(room).emit('move', packet);

      var isLegalMove = Sync.setMove(packet, playerState);

      if (isLegalMove) {
        for (var i in packet) {
          playerState[i] = packet[i];
        }
      }
    }

  };
};