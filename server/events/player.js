var db = require('../db/queries');

module.exports = function (host, sync) {
  return {

    killed: function (socket, packet) {
      var room = host.sockets[socket.id].room;
      var deathNotification = {
        killed: packet.you,
        killer: packet.killer
      };

      // change the playerStats
      db.incKillCount(room, deathNotification.killer);
      db.incDeathCount(room, deathNotification.killed);

      socket.emit('killed', deathNotification);
      socket.broadcast.to(room).emit('killed', deathNotification);
    },

  };
};