var Sync = require('./sync.js');
var host, io, socket, context;

var Events = function( obj ) {
  var events = methods;
  if(obj.args !== undefined) {
    for(var i in obj.args) {
      events[i] = obj.args[i];
    }
  }
  host = obj.host;
  io = obj.io;
  socket = obj.socket;
  context = obj.context;
  return events; 
}

var methods = {};

methods.join = function( data ) {
  console.log(data);
  console.log('Player joined: ' +data.name + " at " + data.room);
  
  if(host.rooms[data.room] === undefined) {
  	host.init(socket, data.room, data);
  } else {
  	host.add(socket, data.room, data);
  }
  var target = host.rooms[data.room];
  socket.emit('player list', target.playerList);
  socket.emit('map', context.mapItems);
  socket.broadcast.to(data.room).emit('join', target.playerList[data.name]);
};

methods.disconnect = function() {
  var target = host.sockets[socket];
  delete host.rooms[target.room].playerList[target.name];
  delete host.sockets[socket];
  socket.broadcast.to(target.room).emit('leave', {name: target.name});
};

module.exports = Events;
