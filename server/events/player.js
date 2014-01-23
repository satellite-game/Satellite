module.exports = function (host, sync) {
  return {

    killed: function (socket, packet) {
      var room = host.sockets[socket.id].room;
      var deathNotification = {
        killed: packet.you,
        killer: packet.killer
      };
      socket.emit('killed', deathNotification);
      socket.broadcast.to(room).emit('killed', deathNotification);
    },

  };
}