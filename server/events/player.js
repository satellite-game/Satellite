var db = require('../db/queries');
var globals = require('../events/bots');

module.exports = function (host, sync, io) {
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
      if (socket.id === globals.hostPlayer) {
        for (var key in globals.clients) {
          if (key !== globals.hostPlayer) { globals.hostPlayer = key; }
          break;
        }
      }
      io.sockets.socket(globals.hostPlayer).emit("bot retrieval");
      socket.emit('killed', deathNotification);
      socket.broadcast.to(room).emit('killed', deathNotification);
    },

    // add rooms to all functions
    botInfo: function ( socket, packet) {
      // check this out: https://github.com/LearnBoost/socket.io/wiki/How-do-I-send-a-response-to-all-clients-except-sender%3F
      io.sockets.socket(globals.lastClient).emit('bot positions', message);
    },

    botHit: function ( socket, packet) {
      var response = {
        zappedName: packet.yourName,
        killerName: packet.botName
      };

      socket.broadcast.emit('hit', response);
      socket.emit('hit', response);
    },

    botUpdate: function ( socket, packet) {
      socket.broadcast.emit('bot positions', packet);
    },
  };
};
