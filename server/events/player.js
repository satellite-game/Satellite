module.exports = function (host, sync) {
  return {

    killed: function (socket, packet) {
      socket.emit('killed', {
        killed: packet.you,
        killer: packet.killer
      });
      socket.broadcast.emit('killed', {
        killed: packet.you,
        killer: packet.killer
      });
    },

  };
}