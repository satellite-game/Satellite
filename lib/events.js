var Sync = require('./sync.js');
var host, io, context; 

var util_methods = {}; // move all of these into a separate file system 
var c_methods = {};
var p_methods = {};
var bot_methods = {};
var custom_methods = {};

var Events = function( init, aug ) {
  var system = {};
  
  host = init.host;
  io = init.io;
  context = init.context;

  system.combat = c_methods;
  system.flow = util_methods; 
  system.player = p_methods; 
  system.bot = bot_methods;

  if(aug !== undefined) {
    util_methods.augment.apply(system, obj.args);
  };

  Sync = new Sync();
  
  return system; 
};
// 100 units every second?

util_methods.join = function( socket, data ) {
  var target;
  if(host.rooms[data.room] === undefined) {
    host.init(socket.id, data.room, data);
    target = host.rooms[data.room];
    Sync.sync(io, data.room, host.rooms[data.room].gamestate);
    Sync.setInit( socket.id, target, data );
  } else {
    host.add(socket.id, data.room, data);
    target = host.rooms[data.room];
    Sync.setInit( socket.id, target, data );
  }

  socket.emit('player list', target.playerList);
  socket.emit('map', context.mapItems);
  socket.join(data.room);
  socket.broadcast.to(data.room).emit('join', data);
};

util_methods.disconnect = function( socket ) {
  var room = host.sockets[socket.id].room;
  var name = host.sockets[socket.id].name;
  socket.broadcast.to(room).emit('leave', {name: name});
  delete host.rooms[room].gamestate[name];
  delete host.rooms[room].playerList[name];
  delete host.sockets[socket.id];
};

c_methods.move = function( socket, packet ) {
  var player_state = host.rooms[host.sockets[socket.id].room]
                         .gamestate[host.sockets[socket.id].name];
  if(Sync.setMove(packet, player_state)) {
    for(var i in packet) {
      player_state[i] = packet[i];
    };
    //socket.broadcast.to(host.sockets[socket.id].room).emit('move', player_state); -- depracated due to Sync.
  }
};

c_methods.fire = function( socket, packet ) {
 
};

p_methods.died = function( socket, packet ) {
 
};

c_methods.accel = function( socket, packet ) {
// this method deals with
};



module.exports = Events;
