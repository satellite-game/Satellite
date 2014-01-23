module.exports = function (host, sync) {
  return {

    killed: function (socket, packet) {
      socket.broadcast.emit('killed', {
        killed: packet.you,
        killer: packet.killer
      });
    },

  };
}