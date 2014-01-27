var db = require('../db/queries');
var globals = require('./globals');

module.exports = function (map, host, Sync, io) {
  return {
    join: function( socket, data ) {
      var target;
      if(host.rooms[data.room] === undefined) {
        host.init(socket.id, data.room, data);
        target = host.rooms[data.room];
        Sync.setInit( socket.id, target, data );
        host.rooms[data.room].sync(io, data.room);
      } else {
        host.add(socket.id, data.room, data);
        target = host.rooms[data.room];
        Sync.setInit( socket.id, target, data );
      }

      db.joinRoom(data.room, data.name);  // add to game in the db

      socket.emit('player list', target.playerList);
      socket.emit('map', map.mapItems);
      socket.join(data.room);
      socket.broadcast.to(data.room).emit('join', data);

      // ************************************************************************ //
      // doesn't account for rooms -- assumes that this is passed into closure.
      console.log('\nJOINED-BEFORE:\n', globals);
      globals.lastClient = socket.id;
      globals.clients[socket.id] = true;
      for (var key in globals.clients) {
        if (!globals.hostPlayer) {
          globals.hostPlayer = key;
        }
        break;
      }
      io.sockets.socket(globals.hostPlayer).emit("bot retrieval");
      console.log('\nJOINED-AFTER:\n', globals);
      // ************************************************************************ //
    },

    disconnect: function( socket ) {
      var room = host.sockets[socket.id].room;
      var name = host.sockets[socket.id].name;

      console.log('\nDISCONNECTED-BEFORE:\n', globals);
      db.leaveRoom(room, name); // boot from the game in the db
      delete globals.clients[socket.id];
      if (globals.hostPlayer === socket.id) {
        for (var key in globals.clients) {
          globals.hostPlayer = key;
          io.sockets.socket(globals.hostPlayer).emit("bot retrieval");
          break;
        }
      }
      console.log('\nDISCONNECTED-AFTER:\n', globals);

      socket.broadcast.to(room).emit('leave', {name: name});
      delete host.rooms[room].gamestate[name];
      delete host.rooms[room].playerList[name];
      delete host.sockets[socket.id];
    },

  };
};
