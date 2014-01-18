var Sync = require('./sync.js');


var Events = function( obj ) {
  if(obj.args !== undefined) {
    this.augment(obj.args);
  }
  this.host = obj.host;
  this.io = obj.io;
  this.socket = obj.socket;
  this.context = obj.context;
  this.methods = Object.create(Events.prototype); 

};



Events.prototype.join = function( data ) {
  console.log('Player joined: ' +data.name + " at " + data.room);
  console.log(this);
  if(this.host.rooms[data.room] === undefined) {
    console.log("new room initialized");
    this.host.init(this.socket.id, data.room, data);
  } else {
    console.log("A player has joined an existing room");
    this.host.add(this.socket.id, data.room, data);
  }
  var target = this.host.rooms[data.room];
  this.socket.emit('player list', target.playerList);
  this.socket.emit('map', this.context.mapItems);
  this.socket.broadcast.to(data.room).emit('join', target.playerList[data.name]);
};

Events.prototype.disconnect = function() {
  console.log(this.socket.id)
  var room = this.host.sockets[this.socket.id].room;
  var name = this.host.sockets[this.socket.id].name;
  // delete host.rooms[room].playerList[name];
  // delete host.sockets[socket.id];
  this.socket.broadcast.to(room).emit('leave', {name: name});
};

Events.prototype.augment = function( args ) {

};

module.exports = Events;
