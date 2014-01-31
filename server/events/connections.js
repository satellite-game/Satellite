var db = require('../db/queries');
var globals = require('./globals'); 

module.exports = function (map, host, Sync, io) {
  return {
    join: function( socket, data ) {
      // database stuff:
      var savedSocketData = host.sockets[socket.id];
      if (savedSocketData) {
        // switching rooms:
        db.leaveRoom(savedSocketData.room, savedSocketData.name);
        db.joinRoom(data.room, savedSocketData.name);
      } else {
        // joining a room for the first time:
        db.joinRoom(data.room, data.name);
      }

      var target;
      if(host.rooms[data.room] === undefined) {
        host.init(socket, data.room, data);
        target = host.rooms[data.room];
        Sync.setInit( socket, target, data ); //depreicated?
        host.rooms[data.room].sync(io, data.room); //depreicated?
        
        host.rooms[data.room].bot = globals();
        target.bot.lastClient = socket.id;
        target.bot.clients[socket.id] = true; 

        
      } else {
        host.add(socket, data.room, data);
        target = host.rooms[data.room];
        Sync.setInit( socket, target, data );

        target.bot.lastClient = socket.id;
        target.bot.clients[socket.id] = true;
      }

      socket.emit('player list', target.playerList);
      socket.emit('map', map.mapItems);
      socket.join(data.room);
      socket.broadcast.to(data.room).emit('join', data);
      
      for (var key in target.bot.clients) {
        if (!target.bot.hostPlayer) {
          target.bot.hostPlayer = key;
        }
        break;
      }
      io.sockets.socket(target.bot.hostPlayer).emit('baseInfo');
      io.sockets.socket(target.bot.hostPlayer).emit("bot retrieval");
    },

    disconnect: function( socket ) {
      if(host.sockets[socket.id] === undefined) {
        socket.disconnect(true);
        return console.log("Something is undefined on line 50, aborting.");
      }
      // console.log('socket:=================', socket, '\n=================');
      // console.log('host.sockets:=================', host.sockets, '\n=================');
      // console.log('host:=================', host, '\n=================');
      var room = host.sockets[socket.id].room;
      var name = host.sockets[socket.id].name;
      var target = host.rooms[room].bot; 
      
      db.leaveRoom(room, name); 

      delete target.clients[socket.id];
      if (target.hostPlayer === socket.id) {
        for (var key in target.clients) {
          target.hostPlayer = key;
          io.sockets.socket(target.hostPlayer).emit("bot retrieval");
          break;
        }
      }
      
      //if the hostplayer hasn't change, no more clients remaining - reset to null
      if (target.hostPlayer === socket.id) { target.hostPlayer = null; }

      socket.broadcast.to(room).emit('leave', {name: name});
      socket.leave(room);
      delete host.rooms[room].gamestate[name];
      delete host.rooms[room].playerList[name];
      delete host.sockets[socket.id];
    },

    change: function( socket, room ) {
      if(host.sockets[socket.id] === undefined) {
        socket.disconnect(true);
        return console.log("There was an error in changing rooms, aborting, please reconnect!");
      }
      var myData = {};
      for(var i in host.sockets[socket.id]) {
        myData[i] = host.sockets[socket.id][i];
      }

      this.disconnect(socket);
      this.join( socket, room );
    },

    query: function( socket ) {
      var rooms = host.rooms;
      socket.emit('roomQuery', Object.keys(rooms));
    }

  };
};
