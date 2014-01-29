var db = require('../db/queries');

module.exports = function (host, sync, io) {
  return {

    killed: function (socket, packet) {
      var room = host.sockets[socket.id].room;
      var target = host.rooms[room].bot;

      if(target === undefined || room === undefined) {
        socket.disconnect(true);
        return console.log("Target or Room is undefined at killed");
      }

      var deathNotification = {
        killed: packet.you,
        killer: packet.killer
      };

      
      db.incKillCount(room, deathNotification.killer);
      db.incDeathCount(room, deathNotification.killed);

 
      if (socket.id === target.hostPlayer) {
        for (var key in target.clients) {
          if (key !== target.hostPlayer) { target.hostPlayer = key; }
          break;
        }
      }

      io.sockets.socket(target.hostPlayer).emit("bot retrieval");
      socket.broadcast.to(room).emit('killed', deathNotification);
    },

    botInfo: function ( socket, packet) {
      console.log(host.sockets[socket.id]);
      var room = host.sockets[socket.id].room;
      var target = host.rooms[room].bot;
      if(target === undefined || room === undefined) {
        socket.disconnect(true);
        return console.log("Target or Room is undefined at botInfo, this is bot ", target , "and this is room", room);
      }

      io.sockets.socket(target.lastClient).emit('bot positions', packet);
    },

    botHit: function ( socket, packet) {
      var room = host.sockets[socket.id];

      if( room === undefined) {
        socket.disconnect(true);
        return console.log("Room doesn't exist at botHit");
      }

      var response = {
        zappedName: packet.yourName,
        killerName: packet.botName
      };
      console.log('helahfdlkajfd', room);
      socket.broadcast.to(room.room).emit('hit', response);
      socket.emit('hit', response);
    },

    botUpdate: function ( socket, packet) {
      var room = host.sockets[socket.id];
      if( host.sockets[socket.id] === undefined) {
        socket.disconnect(true);
        return console.log("Room doesn't exist");
      }
      
      socket.broadcast.to(room.room).emit('bot positions', packet);
    },

    baseFire: function (socket, packet) {
      socket.emit('baseHit', packet);
    }

  };
};
